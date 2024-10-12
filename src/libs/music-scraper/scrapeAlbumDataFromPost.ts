import axios from "axios";
import * as cheerio from "cheerio";
import { extractAlbumInformationFromHTML } from "./utils";
import { type BasicAlbum } from "../../types";

export async function scrapeAlbumDataFromPost(url: string): Promise<{
  cleanAlbums: BasicAlbum[];
  postDate: string;
} | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const dateMetaTag = $('meta[name="date"]');
    const postDate = dateMetaTag.attr("content") || "";

    // Load HTML into Cheerio
    const featuredAlbumsElement = $("main p, h3").filter((i, element) => {
      // return /feature?d albums/i.test($(element).text());
      return /feature?d albums/i.test($(element).text());
    });

    if (!featuredAlbumsElement) {
      console.error(`missing albums at ${url}`);
      return null;
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
      return null;
    }

    const cleanAlbums =
      extractAlbumInformationFromHTML({
        rawHtmlContent,
      }) || [];

    return { cleanAlbums, postDate };
  } catch (error) {
    console.error("Error scraping NPR Music:", error);
    return null;
  }
}
