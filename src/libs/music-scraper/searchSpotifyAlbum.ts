import axios from "axios";

type ExternalUrls = {
  spotify: string;
};

type Artist = {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
};

type Image = {
  height: number;
  url: string;
  width: number;
};

type SpotifyReturnAlbum = {
  album_type: "album";
  artists: Artist[];
  available_markets: string[]; // List of country codes where the album is available
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string; // (format: YYYY-MM-DD)
  release_date_precision: "day" | "month" | "year";
  total_tracks: number;
  type: "album";
  uri: string;
};

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
