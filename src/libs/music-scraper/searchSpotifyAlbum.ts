import axios from "axios";
import { SpotifyReturnAlbum } from "@/types";

const SPOTIFY_SEARCH_URL =
  process.env.SPOTIFY_URL || "https://api.spotify.com/v1/search?q=";

export async function searchSpotifyAlbum(
  artist: string,
  albumTitle: string,
  token: string
): Promise<SpotifyReturnAlbum | null> {
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
