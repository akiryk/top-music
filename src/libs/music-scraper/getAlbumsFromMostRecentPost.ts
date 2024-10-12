import axios from "axios";
import {
  getSpotifyToken,
  getAlbumPreviews,
  scrapeAlbumDataFromPost,
  getLatestPostFromNPRNewMusicFridayHTML,
} from "./index";

const NEW_MUSIC_URL: string =
  process.env.NPR_NEW_MUSIC_URL ||
  "https://www.npr.org/sections/allsongs/606254804/new-music-friday";

export async function getAlbumsFromMostRecentPost() {
  try {
    const { data } = await axios.get(NEW_MUSIC_URL);
    const postUrl = getLatestPostFromNPRNewMusicFridayHTML(data);
    if (!postUrl) {
      return null;
    }

    const albumData = await scrapeAlbumDataFromPost(postUrl);

    if (albumData?.cleanAlbums) {
      const token = await getSpotifyToken();
      const albumsWithSongs = await getAlbumPreviews(
        albumData.cleanAlbums,
        token
      );
      return { albumsWithSongs, postUrl, postDate: albumData.postDate };
    }
  } catch (error) {
    console.error("Error scraping the New Music Friday post:", error);
    return null;
  }
}
