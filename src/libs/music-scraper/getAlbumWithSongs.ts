import { searchSpotifyAlbum } from "./searchSpotifyAlbum";
import { getAlbumTracks } from "./getAlbumTracks";
import type { BasicAlbum } from "../../types";

export async function getAlbumWithSongs(albums: BasicAlbum[], token: string) {
  const albumPreviews = [];

  for (const { artist, title } of albums) {
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
        imageUrl: spotifyAlbum.images[0]?.url,
        imageWidth: spotifyAlbum.images[0]?.width,
        imageHeight: spotifyAlbum.images[0]?.height,
        totalTracks: spotifyAlbum.total_tracks,
        releaseDate: spotifyAlbum.release_date,
        spotifyAlbumId: spotifyAlbum.id,
        spotifyAlbumUrl: spotifyAlbum.external_urls.spotify,
        tracks,
      });
    }
  }

  return albumPreviews;
}
