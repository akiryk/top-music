import axios from "axios";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import path from "path";
import fs from "fs";
import he from "he";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

export type Track = {
  name: string;
  preview_url?: string; // Optional property
  title: string;
};

export type TrackPreview = {
  name: string;
  preview_url: string | null; // preview URL might be null if not available
};

export interface BasicAlbum {
  artist: string;
  title: string;
  postDate: string;
  url: string;
}

export interface AlbumAndTracks {
  artist: string;
  title: string;
  postDate: string;
  url: string;
  tracks: Track[];
  releaseDate: string;
  listingUrl: string;
  imageUrl: string;
  albumUrl: string;
  hasPreviewTracks: boolean;
  images: Array<Record<string, string>>;
  total_tracks: number;
  release_date: Date;
  external_urls: Record<string, string>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const NEW_MUSIC_FILENAME = "new-music";
const NEW_MUSIC_URL: string =
  process.env.NPR_NEW_MUSIC_URL ||
  "https://www.npr.org/sections/allsongs/606254804/new-music-friday";
const SPOTIFY_SEARCH_URL =
  process.env.SPOTIFY_URL || "https://api.spotify.com/v1/search?q=";
const SPOTIFY_ALBUMS_URL =
  process.env.SPOTIFY_URL || "https://api.spotify.com/v1/albums/";

type AlbumList = BasicAlbum[];

const removeZeroWidthChars = (text: string) => {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Removes zero-width space, zero-width non-joiner, zero-width joiner, and zero-width no-break space
};

async function scrapeAlbumDetails(url: string): Promise<AlbumList> {
  try {
    // Fetch the NPR New Music Friday page
    const { data } = await axios.get(url);

    // Load HTML into Cheerio
    const $ = cheerio.load(data);

    const dateMetaTag = $('meta[name="date"]');
    const dateString = dateMetaTag.attr("content") || "";
    const postDate = new Date(dateString);
    const featuredAlbumsElement = $("main p, h3").filter((i, element) => {
      // return /feature?d albums/i.test($(element).text());
      return /feature?d albums/i.test($(element).text());
    });

    if (!featuredAlbumsElement.length) {
      console.error(`missing albums at ${url}`);
      return [];
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

    const cleanAlbums = albumsContent
      ?.split("•")
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

        // console.log(dateString);

        return {
          artist: he.decode(safeArtistName),
          title: he.decode(safeAlbumalbumTitle),
          postDate: postDate.toISOString().split("T")[0],
          url,
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

async function getAlbums() {
  try {
    const { data } = await axios.get(NEW_MUSIC_URL);
    const $ = cheerio.load(data);
    const links: string[] = [];

    $("h2.title").each((i, element) => {
      const titleText = $(element).text().trim(); // Get the albumTitle text
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
      const albumDetails = await scrapeAlbumDetails(link);
      allAlbums.push(...albumDetails); // Collect all albums
    }
    return allAlbums;
  } catch (error) {
    console.error("Error scraping the main page:", error);
  }
}

async function saveAlbumsToJSON(albums: BasicAlbum[]) {
  const assetsPath = process.env.ASSETS_PATH || "src/assets";
  const savePath = path.join(
    process.cwd(),
    assetsPath,
    `${NEW_MUSIC_FILENAME}.json`
  );

  // Save the collected albums to a JSON file
  fs.writeFileSync(savePath, JSON.stringify(albums, null, 2));

  console.log("All album data scraped and saved successfully!");
}

async function searchSpotifyAlbum(
  artist: string,
  albumTitle: string,
  token: string
): Promise<(AlbumAndTracks & { id: string }) | null> {
  const searchQuery = `${albumTitle}%20artist:${artist}&type=album`;
  // TODO: consider batch requests
  const url = `${SPOTIFY_SEARCH_URL}${encodeURIComponent(
    searchQuery
  )}&type=album&limit=1`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const albums = response.data.albums.items;
    if (albums.length > 0) {
      return albums[0]; // Return the album
    } else {
      console.log(`No album found for ${artist} - ${albumTitle}`);
      return null;
    }
  } catch (error) {
    console.error(`Error searching album ${albumTitle} by ${artist}:`, error);
    return null;
  }
}

async function getAlbumTracks(
  albumId: string,
  token: string
): Promise<TrackPreview[]> {
  const url = `${SPOTIFY_ALBUMS_URL}${albumId}/tracks`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.items.map((track: Track) => ({
      name: track.name,
      preview_url: track.preview_url,
    }));
  } catch (error) {
    console.error(`Error fetching tracks for album ${albumId}:`, error);
    return [];
  }
}

async function getSpotifyToken() {
  const tokenUrl =
    process.env.SPOTIFY_TOKEN_URL || "https://accounts.spotify.com/api/token";
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    throw new Error("Missing spotify credentials: no secret or id");
  }
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      tokenUrl,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token; // This is your access token
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
  }
}

// album:
// - id
// - artist
// - title

// track
// - id
// - title
// - preview_url

async function getAlbumPreviews(albums: AlbumList, token: string) {
  const albumPreviews = [];

  for (const { artist, title, postDate, url } of albums) {
    // Search for the album
    const spotifyAlbum = await searchSpotifyAlbum(artist, title, token);
    if (spotifyAlbum) {
      // Get tracks and previews
      const tracks = await getAlbumTracks(spotifyAlbum.id, token);
      if (tracks.length === 0) {
        console.log(`no tracks for ${title}`);
      }
      albumPreviews.push({
        artist,
        title,
        postDate,
        url,
        image: spotifyAlbum.images[0],
        totalTracks: spotifyAlbum.total_tracks,
        releaseDate: spotifyAlbum.release_date,
        spotifyAlbumId: spotifyAlbum.id,
        spotifyAlbumUrl: spotifyAlbum.external_urls.spotify,
        tracks: tracks.filter((track) => {
          if (track.preview_url) {
            // console.log(`no preview url for ${albumTitle}: ${track.name}`);
            console.log(spotifyAlbum.id);
          }
          return track.preview_url !== null;
        }), // Only keep tracks with previews
      });
    }
  }

  return albumPreviews;
}

async function fetchAllPreviews(albums: AlbumList, token: string) {
  const albumPreviews = await getAlbumPreviews(albums, token);
  return albumPreviews;
}

async function getAlbumsWithSongs() {
  const albums = await getAlbums();
  // const token = await getSpotifyToken();
  // console.log(token);
  if (albums) {
    const token = await getSpotifyToken();
    const albumsWithSongs = await fetchAllPreviews(albums, token);
    // console.log(albumsWithSongs);
    saveAlbumsToJSON(albumsWithSongs);
  }
}

getAlbumsWithSongs();
