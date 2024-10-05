export interface Album {
  artist: string;
  title: string;
  postDate: string;
  url: string;
}

export interface AlbumAndTracks extends Album {
  tracks: Track[];
  releaseDate: string;
  listingUrl: string;
  imageUrl: string;
  albumUrl: string;
  hasPreviewTracks: boolean;
  images: Array<Record<string, string>>;
  total_tracks: number;
  release_date: Date;
  external_urls: Record<string, string>;
}

export type DisplayAlbum = {
  tracks: Track[];
  releaseDate: string;
  listingUrl: string;
  imageUrl: string;
  albumUrl: string;
  hasPreviewTracks: boolean;
  images: Array<Record<string, string>>;
  title: string;
};

export type DBAlbum = {
  id: string;
  artist: string;
  title: string;
  releaseDate: string;
  imageUrl: string;
  postDate: string;
  listingUrl: string;
  tracks: Track[];
  hasPreviewTracks: boolean;
  albumUrl: string;
};

export type Track = {
  name: string;
  preview_url?: string; // Optional property
  title: string;
};

export type Image = {
  height: number;
  width: number;
  url: string;
};

export type TrackPreview = {
  name: string;
  preview_url: string | null; // preview URL might be null if not available
};
