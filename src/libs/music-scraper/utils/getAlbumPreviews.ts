import { searchSpotifyAlbum } from "./searchSpotifyAlbum";
import { getAlbumTracks } from "./getAlbumTracks";
import type { AlbumList } from "../types";

// this is the type that gets pushed to albumPreviews based on console.log
export type AlbumPreviews = {
  artist: string;
  title: string;
  postDate: string;
  url: string;
  image: {
    height: number;
    url: string;
    width: number;
  };
  totalTracks: number;
  releaseDate: string;
  spotifyAlbumId: string;
  spotifyAlbumUrl: string;
  tracks: {
    name: string;
    preview_url: string;
  }[];
};

export async function getAlbumPreviews(albums: AlbumList, token: string) {
  const albumPreviews: AlbumPreviews[] = [];

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
        // Only keep tracks with previews
        // @ts-expect-error because tracks truly does have preview_url
        tracks: tracks.filter((track) => track.preview_url !== null),
      });
    }
  }

  return albumPreviews;
}
