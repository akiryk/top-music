import axios from "axios";
import {
  getSpotifyToken,
  getAlbumPreviews,
  scrapeNamesOfAlbumsFromPost,
  getLatestPostFromNPRNewMusicFridayHTML,
} from "../index";

const NEW_MUSIC_URL: string =
  process.env.NPR_NEW_MUSIC_URL ||
  "https://www.npr.org/sections/allsongs/606254804/new-music-friday";

export async function getAlbumsFromMostRecentPost() {
  try {
    const { data } = await axios.get(NEW_MUSIC_URL);
    const latestPostURL = getLatestPostFromNPRNewMusicFridayHTML(data);
    if (!latestPostURL) {
      return null;
    }

    const albumDetails = await scrapeNamesOfAlbumsFromPost(latestPostURL);

    if (albumDetails) {
      const token = await getSpotifyToken();
      const albumsWithSongs = await getAlbumPreviews(albumDetails, token);
      return { albumsWithSongs, latestPostURL };
    }
  } catch (error) {
    console.error("Error scraping the New Music Friday post:", error);
    return null;
  }
}
