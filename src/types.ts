export interface BasicAlbum {
  artist: string;
  title: string;
}

// This is the type returned from getAlbumsFromMostRecentPost(),
// which returns an array of albums (it also returns a postURL)
export type AlbumFromDatabase = {
  id: number;
  artist: string;
  album_title: string;
  postDate: string;
  tracks: Track[];
  release_date: Date;
  spotify_album_id: string;
  spotify_album_url: string;
  image_url: string;
  image_width: number;
  image_height: number;
  post_date: Date;
  listing_url: string;
};

// this is the type that gets pushed to albumPreviews based on console.log
export type AlbumPreview = {
  id: string;
  artist: string;
  title: string;
  postUrl: string;
  releaseDate: string; // "YYYY-MM-DD", "YYYY-MM", or "YYYY"
  imageUrl: string;
  spotifyAlbumId: string;
  spotifyAlbumUrl: string;
  tracks: Track[];
};

export type DisplayAlbum = {
  albumTitle: string;
  artist: string;
  id: string;
  imageHeight: number;
  imageUrl: string;
  imageWidth: number;
  postDate: string;
  postUrl: string;
  releaseDate: string; // "YYYY-MM-DD", "YYYY-MM", or "YYYY"
  spotifyAlbumId: string;
  spotifyAlbumUrl: string;
  tracks: Track[];
  hasPreviewTracks: boolean;
};

export type Track = {
  preview_url?: string; // Optional property
  name: string;
};

export type Image = {
  height: number;
  width: number;
  url: string;
};

type SpotifyExternalUrls = {
  spotify: string;
};

type SpotifyArtist = {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
};

type SpotifyImage = {
  height: number;
  url: string;
  width: number;
};

export type SpotifyReturnAlbum = {
  album_type: "album";
  artists: SpotifyArtist[];
  available_markets: string[]; // List of country codes where the album is available
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string; // (format: YYYY-MM-DD)
  release_date_precision: "day" | "month" | "year";
  total_tracks: number;
  type: "album";
  uri: string;
};
