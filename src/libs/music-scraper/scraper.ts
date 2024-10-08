import axios from "axios";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import path from "path";
import he from "he";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getAlbumPreviews } from "./getAlbumPreviews";
import { getSpotifyToken } from "./getSpotifyToken";
import type { AlbumList } from "./types";

// type Image = {
//   height: number;
//   url: string;
//   width: number;
// };
// type AlbumsWithSongs = {
//   artist: string;
//   title: string;
//   postDate: string;
//   url: string;
//   image: Image;
//   totalTracks: number;
//   releaseDate: string;
//   spotifyAlbumId: string;
//   spotifyAlbumUrl: string;
//   tracks: Track[];
// };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const NEW_MUSIC_URL: string =
  process.env.NPR_NEW_MUSIC_URL ||
  "https://www.npr.org/sections/allsongs/606254804/new-music-friday";

const removeZeroWidthChars = (text: string) => {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Removes zero-width space, zero-width non-joiner, zero-width joiner, and zero-width no-break space
};

// Get the Feature Albums section of HTML, which lists the day's top 5 albums
function getFeaturedAlbumsElement($: cheerio.CheerioAPI, url: string) {
  // Load HTML into Cheerio

  const featuredAlbumsElement = $("main p, h3").filter((i, element) => {
    // return /feature?d albums/i.test($(element).text());
    return /feature?d albums/i.test($(element).text());
  });

  if (!featuredAlbumsElement) {
    console.error(`missing albums at ${url}`);
    return "";
  }

  let albumsContent = featuredAlbumsElement.html();

  if (featuredAlbumsElement.is("h3")) {
    const nextParagraph = featuredAlbumsElement.next("p"); // Get the next <p> sibling
    if (nextParagraph.length) {
      albumsContent = albumsContent
        ? albumsContent + nextParagraph.html()
        : nextParagraph.html(); // Append the HTML of the next <p> tag
    }
  }

  return albumsContent ?? "";
}

function extractAlbumInformationFromHTML({
  rawHtmlContent,
  postDate,
  url,
}: {
  rawHtmlContent: string;
  postDate: Date;
  url: string;
}) {
  return rawHtmlContent
    .split("•")
    .slice(1)
    .map((album) => {
      const [artist, albumTitle] = album
        .trim()
        .replace(/<br\s*\/?>/g, "")
        .replace(/<\/em>/g, "")
        .replace(/<em>,/g, "<em>")
        .split("<em>");

      const artistName = artist.trim().replace(/,\s*$/, "");
      const albumalbumTitle = albumTitle.trim();
      const safeArtistName = removeZeroWidthChars(
        sanitizeHtml(artistName, {
          allowedTags: [], // Remove all HTML tags
          allowedAttributes: {},
        })
      );
      const safeAlbumalbumTitle = removeZeroWidthChars(
        sanitizeHtml(albumalbumTitle, {
          allowedTags: [],
          allowedAttributes: {},
        })
      );

      return {
        artist: he.decode(safeArtistName),
        title: he.decode(safeAlbumalbumTitle),
        postDate: postDate.toISOString().split("T")[0],
        url,
      };
    });
}

function getBlogPostDate($: cheerio.CheerioAPI) {
  const dateMetaTag = $('meta[name="date"]');
  const dateString = dateMetaTag.attr("content") || "";
  return new Date(dateString);
}

// Get album details from a single new music Friday blog post url
async function scrapeNamesOfAlbumsFromPost(url: string): Promise<AlbumList> {
  try {
    // Get HTML for a given new music friday post
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const postDate = getBlogPostDate($);

    // raw HTML content for the section of a page with top albums
    const rawHtmlContent = getFeaturedAlbumsElement($, url);

    if (!rawHtmlContent) {
      return [];
    }

    const cleanAlbums = extractAlbumInformationFromHTML({
      rawHtmlContent,
      postDate: postDate || new Date(),
      url,
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

// get posts from html for the New Music Friday homepage
// function getPostsFromNPRNewMusicFridayHTML(data: string) {
//   const newMusicFridayBlogPostURLs: string[] = [];
//   const $ = cheerio.load(data);
//   // Find the link to New Music Friday blog posts
//   $("h2.title").each((i, element) => {
//     const titleText = $(element).text().trim(); // Get the albumTitle text
//     const newMusicFridayBlogPost = $(element).find("a").attr("href"); // Find the newMusicFridayBlogPost within the h2
//     if (newMusicFridayBlogPost) {
//       newMusicFridayBlogPostURLs.push(newMusicFridayBlogPost);
//     } else {
//       console.log(`Found title: "${titleText}" but no link found`);
//     }
//   });

//   return newMusicFridayBlogPostURLs;
// }

function getLatestPostFromNPRNewMusicFridayHTML(data: string): string | null {
  const $ = cheerio.load(data);

  // Find the first link to a New Music Friday blog post
  const firstPostElement = $("h2.title").first();

  if (firstPostElement.length > 0) {
    const titleText = firstPostElement.text().trim(); // Get the album title text
    const newMusicFridayBlogPost = firstPostElement.find("a").attr("href"); // Get the first blog post link

    if (newMusicFridayBlogPost) {
      return newMusicFridayBlogPost;
    } else {
      console.log(`Found title: "${titleText}" but no link found`);
    }
  } else {
    console.log("No New Music Friday posts found.");
  }

  return null; // Return null if no valid post was found
}

// Return an array of basic album data: title, artist, npr post url, post date
// async function getAlbums() {
//   try {
//     const { data } = await axios.get(NEW_MUSIC_URL);
//     const newMusicFridayBlogPostURLs = getPostsFromNPRNewMusicFridayHTML(data);

//     // Scrape album details from each page in the array of New Music Friday posts
//     const allAlbums: AlbumList = [];
//     for (const newMusicFridayBlogPostURL of newMusicFridayBlogPostURLs) {
//       const albumDetails = await scrapeNamesOfAlbumsFromPost(
//         newMusicFridayBlogPostURL
//       );
//       allAlbums.push(...albumDetails); // Collect all albums
//     }
//     return allAlbums;
//   } catch (error) {
//     console.error("Error scraping the main page:", error);
//   }
// }

// Return an array of basic album data: title, artist, npr post url, post date
async function getAlbumsFromMostRecentPost() {
  try {
    // Fetch the latest New Music Friday post (single URL)
    const { data } = await axios.get(NEW_MUSIC_URL);
    const latestPostURL = getLatestPostFromNPRNewMusicFridayHTML(data); // Expecting one URL now

    if (!latestPostURL) {
      console.error("No New Music Friday post found.");
      return null;
    }

    // Scrape album details from the latest post
    const albumDetails = await scrapeNamesOfAlbumsFromPost(latestPostURL);

    // Return the list of albums from the single post
    return {
      latestPostURL,
      albumDetails,
    };
  } catch (error) {
    console.error("Error scraping the New Music Friday post:", error);
    return null;
  }
}

// async function fetchAllPreviews(albums: AlbumList, token: string) {
//   const albumPreviews = await getAlbumPreviews(albums, token);
//   return albumPreviews;
// }

// async function getAlbumsWithSongs() {
//   const albums = await getAlbums();
//   if (albums) {
//     console.log(albums[0]);
//     // const token = await getSpotifyToken();
//     // const albumsWithSongs = await fetchAllPreviews(albums, token);
//     // console.log(albumsWithSongs);
//     // saveAlbumsToJSON(albumsWithSongs);
//   }
// }

// async function scrapeAlbums(): Promise<AlbumPreviews[] | undefined> {
//   const albums = await getAlbums();
//   if (albums) {
//     const token = await getSpotifyToken();
//     const albumsWithSongs = await getAlbumPreviews(albums, token);
//     console.log(albumsWithSongs);
//     return albumsWithSongs;
//   }
//   console.error(`unable to retrieve albums`);
//   return;
// }

/**
 * Get album information from the most recent top albums blog post
 *
 * @returns Promise<AlbumPreviews[]
 */
export async function scrapeAlbumsFromLatestPost() {
  const albums = await getAlbumsFromMostRecentPost();

  if (albums === null) {
    console.error(`unable to retrieve albums`);
    return;
  }

  const { albumDetails, latestPostURL } = albums;
  if (albumDetails) {
    const token = await getSpotifyToken();
    // console.log(`token is ${token}`);
    const albumsWithSongs = await getAlbumPreviews(albumDetails, token);
    const res = { albumsWithSongs, latestPostURL };
    return res;
  }
}

// export async function getSpotifyPreviewUrls(albums: AlbumList) {
//   const token = await getSpotifyToken();
//   const albumsWithSongs = await fetchAllPreviews(albums, token);
//   return albumsWithSongs;
// }

scrapeAlbumsFromLatestPost();
