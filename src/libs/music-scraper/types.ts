export type Track = {
  preview_url?: string; // Optional property
  title: string;
};

export type ISODateString = `${number}-${number}-${number}`;

export type TrackPreview = {
  name: string;
  preview_url: string | undefined; // preview URL might be null if not available
};

export interface BasicAlbum {
  artist: string;
  title: string;
  postDate: string;
  url: string;
}

export interface AlbumAndTracks {
  artist: string;
  title: string;
  postDate: string;
  url: string;
  tracks: Track[];
  releaseDate: string;
  listingUrl: string;
  imageUrl: string;
  albumUrl: string | undefined;
  hasPreviewTracks: boolean;
  images: Array<Record<string, string>>;
  total_tracks: number;
  release_date: Date;
  external_urls: Record<string, string>;
}

export type AlbumList = BasicAlbum[];
