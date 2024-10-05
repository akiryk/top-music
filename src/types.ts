export type Album = {
  id: number;
  artist: string;
  title: string;
  tracks: Track[];
  releaseDate: string;
  listingUrl: string;
  imageUrl: string;
  albumUrl: string;
  hasPreviewTracks: boolean;
};

interface Track {
  name: string;
  preview_url?: string; // Optional property
  title: string;
}
