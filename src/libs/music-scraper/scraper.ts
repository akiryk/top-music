import axios from "axios";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import path from "path";
import fs from "fs";
import he from "he";

const NEW_MUSIC_FILENAME = "new-music";

type Album = {
  artist: string;
  title: string;
};

type AlbumList = Album[];

const removeZeroWidthChars = (text: string) => {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Removes zero-width space, zero-width non-joiner, zero-width joiner, and zero-width no-break space
};

async function scrapeAlbumDetails(url: string): Promise<AlbumList> {
  try {
    // Fetch the NPR New Music Friday page
    const { data } = await axios.get(url);

    // Load HTML into Cheerio
    const $ = cheerio.load(data);

    const featuredAlbumsElement = $("p").filter((i, element) => {
      if ($(element).text().includes("Feature Albums:")) {
        console.log($(element).text());
      }
      // return $(element).text().includes("Feature Albums:");
      return /feature?d albums/i.test($(element).text());
    });

    if (!featuredAlbumsElement.length) {
      console.error("No featured albums found.");
      return [];
    }

    const albumsContent = featuredAlbumsElement.html();
    const cleanAlbums = albumsContent
      ?.split("•")
      .slice(1)
      .map((album) => {
        const [artist, title] = album
          .trim()
          .replace(/<br\s*\/?>/g, "")
          .replace(/<\/em>/g, "")
          .replace(/<em>,/g, "<em>")
          .split("<em>");

        const artistName = artist.trim().replace(/,\s*$/, "");
        const albumTitle = title.trim();
        const safeArtistName = removeZeroWidthChars(
          sanitizeHtml(artistName, {
            allowedTags: [], // Remove all HTML tags
            allowedAttributes: {},
          })
        );
        const safeAlbumTitle = removeZeroWidthChars(
          sanitizeHtml(albumTitle, {
            allowedTags: [],
            allowedAttributes: {},
          })
        );

        return {
          artist: he.decode(safeArtistName),
          title: he.decode(safeAlbumTitle),
        };
      });

    if (!Array.isArray(cleanAlbums)) {
      return [];
    }
    return cleanAlbums;
  } catch (error) {
    console.error("Error scraping NPR Music:", error);
    return [];
  }
}

async function scrapeMainPage() {
  try {
    const mainPageUrl =
      "https://www.npr.org/sections/allsongs/606254804/new-music-friday";
    const { data } = await axios.get(mainPageUrl);
    const $ = cheerio.load(data);
    const links: string[] = [];
    $("h2.title").each((i, element) => {
      const titleText = $(element).text().trim(); // Get the title text
      const link = $(element).find("a").attr("href"); // Find the link within the h2

      if (link) {
        links.push(link);
      } else {
        console.log(`Found title: "${titleText}" but no link found`);
      }
    });

    // Loop through the links array and scrape album details from each page
    const allAlbums: AlbumList = [];
    for (const link of links) {
      // console.log(`scrape ${link}`);
      const albumDetails = await scrapeAlbumDetails(link);
      allAlbums.push(...albumDetails); // Collect all albums
    }

    const assetsPath = process.env.ASSETS_PATH || "src/assets";
    const savePath = path.join(
      process.cwd(),
      assetsPath,
      `${NEW_MUSIC_FILENAME}.json`
    );

    // Save the collected albums to a JSON file
    fs.writeFileSync(savePath, JSON.stringify(allAlbums, null, 2));

    console.log("All album data scraped and saved successfully!");
  } catch (error) {
    console.error("Error scraping the main page:", error);
  }
}

scrapeMainPage();
