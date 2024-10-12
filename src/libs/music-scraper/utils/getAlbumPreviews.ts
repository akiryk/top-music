import {
  searchSpotifyAlbum,
  type SpotifyReturnAlbum,
} from "./searchSpotifyAlbum";
import { getAlbumTracks } from "./getAlbumTracks";
import type { AlbumList, ISODateString } from "../types";

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
  releaseDate: ISODateString;
  spotifyAlbumId: string;
  spotifyAlbumUrl: string;
  tracks: {
    name: string;
    preview_url: string;
  }[];
};

function isISODateString(dateString: string): dateString is ISODateString {
  // This regex checks for a pattern like 'YYYY-MM-DD'
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

function getValidReleaseDate(
  initialReleaseDate: string,
  spotifyAlbum: SpotifyReturnAlbum
) {
  let validReleaseDate: ISODateString;
  if (isISODateString(initialReleaseDate)) {
    // Now TypeScript knows this is a valid ISODateString
    validReleaseDate = initialReleaseDate;
  } else {
    validReleaseDate = "10-10-3000";
    console.error(
      `Invalid release date for spotify album id ${spotifyAlbum.id}`
    );
  }
  return validReleaseDate;
}

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
      const initialReleaseDate: string = spotifyAlbum.release_date;
      const validReleaseDate: ISODateString = getValidReleaseDate(
        initialReleaseDate,
        spotifyAlbum
      );

      albumPreviews.push({
        artist,
        title,
        postDate,
        url,
        image: spotifyAlbum.images[0],
        totalTracks: spotifyAlbum.total_tracks,
        releaseDate: validReleaseDate,
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
