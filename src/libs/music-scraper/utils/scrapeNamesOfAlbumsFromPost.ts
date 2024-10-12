import axios from "axios";
import * as cheerio from "cheerio";
import { extractAlbumInformationFromHTML } from "./utils";

export async function scrapeNamesOfAlbumsFromPost(url: string) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const dateMetaTag = $('meta[name="date"]');
    const dateString = dateMetaTag.attr("content") || "";
    const postDate = new Date(dateString);

    // Load HTML into Cheerio

    const featuredAlbumsElement = $("main p, h3").filter((i, element) => {
      // return /feature?d albums/i.test($(element).text());
      return /feature?d albums/i.test($(element).text());
    });

    if (!featuredAlbumsElement) {
      console.error(`missing albums at ${url}`);
      return "";
    }

    let rawHtmlContent = featuredAlbumsElement.html();

    if (featuredAlbumsElement.is("h3")) {
      const nextParagraph = featuredAlbumsElement.next("p"); // Get the next <p> sibling
      if (nextParagraph.length) {
        rawHtmlContent = rawHtmlContent
          ? rawHtmlContent + nextParagraph.html()
          : nextParagraph.html(); // Append the HTML of the next <p> tag
      }
    }

    if (!rawHtmlContent) {
      return [];
    }

    const cleanAlbums = extractAlbumInformationFromHTML({
      rawHtmlContent,
      postDate: postDate || new Date(),
      url,
    });

    return cleanAlbums || [];
  } catch (error) {
    console.error("Error scraping NPR Music:", error);
    return [];
  }
}
