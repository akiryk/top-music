// export type DisplayAlbum = {
//   tracks: Track[];
//   releaseDate: string;
//   listingUrl: string;
//   imageUrl: string;
//   albumUrl: string;
//   hasPreviewTracks: boolean;
//   images: Array<Record<string, string>>;
//   title: string;
// };

export type DisplayAlbum = {
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
