import axios from "axios";
import type { SpotifyTrack, Track } from "../../types";

const SPOTIFY_ALBUMS_URL =
  process.env.SPOTIFY_URL || "https://api.spotify.com/v1/albums/";

export async function getAlbumTracks(
  albumId: string,
  token: string
): Promise<Track[]> {
  const url = `${SPOTIFY_ALBUMS_URL}${albumId}/tracks`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.items.map((track: SpotifyTrack) => ({
      title: track.name,
      preview_url: track.preview_url,
    }));
  } catch (error) {
    console.error(`Error fetching tracks for album ${albumId}:`, error);
    return [];
  }
}
