import { getAlbumsFromMostRecentPost } from "@/libs/music-scraper";

const testGettingAlbums = async () => {
  const albums = await getAlbumsFromMostRecentPost();
  if (!Array.isArray(albums?.albumsWithSongs)) {
    console.log("no joy getting albums today");
    return;
  }
  for (const album of albums.albumsWithSongs) {
    const {
      artist,
      title,
      postDate,
      image: { url },
      releaseDate,
      tracks,
    } = album;
    console.log(`
artist: ${artist}
title: ${title}
postDate: ${postDate}
url: ${url}
releaseDate: ${releaseDate}`);
    for (const track of tracks) {
      const { name, preview_url } = track;
      console.log(`  trackName: ${name}`);
    }
  }
};

testGettingAlbums();
