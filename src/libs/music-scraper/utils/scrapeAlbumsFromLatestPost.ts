import { getAlbumsFromMostRecentPost } from "./getAlbumsFromMostRecentPost";
import { getSpotifyToken } from "./getSpotifyToken";
import { getAlbumPreviews } from "./getAlbumPreviews";

/**
 * Get album information from the most recent top albums blog post
 *
 * @returns Promise<AlbumPreviews[]
 */
export async function scrapeAlbumsFromLatestPost() {
  const albums = await getAlbumsFromMostRecentPost();

  if (!albums) {
    console.error(`unable to retrieve albums`);
    return;
  }

  const { albumsWithSongs, latestPostURL } = albums;
  if (albumsWithSongs) {
    const token = await getSpotifyToken();
    // console.log(`token is ${token}`);
    const albumsWithSongs = await getAlbumPreviews(albumsWithSongs, token);
    const res = { albumsWithSongs, latestPostURL };
    return res;
  }
}
