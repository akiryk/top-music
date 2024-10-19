import { NextResponse } from "next/server";
import { getAlbumsFromMostRecentPost } from "@/libs/music-scraper"; // Custom functions for scraping
import {
  createAlbum,
  createImage,
  createTrack,
  createListing,
  associateAlbumWithListing,
  postAlreadyScraped,
  insertScrapedPost,
} from "@/db/index"; // DB operations

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDryRun = url.searchParams.get("dryRun") === "true";
  console.log(`isDryRun=${isDryRun}`);
  // Check the Authorization header to verify the cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    // 1. Scrape NPR New Music Friday for the latest post
    const data = await getAlbumsFromMostRecentPost();

    if (!data) {
      console.log("no albums were retrieved by cron job");
      return new Response(null, { status: 204 }); // No content, valid response
    }

    const { albumsWithSongs: albums, postUrl, postDate } = data;

    // 2. Check if the post has already been scraped
    const isScraped = await postAlreadyScraped(postUrl);
    if (isScraped) {
      console.log("");
      console.log(
        `\x1b[1m\x1b[31m Post from ${postUrl.split("/").pop()} was already scraped.`
      );
      console.log(
        `${!isDryRun ? "\x1b[1m\x1b[31m Not scraping again." : "\x1b[1m\x1b[32m Scaping anyway for dry run..."}`
      );
      console.log("");
      if (!isDryRun) {
        return new Response(null, { status: 204 }); // No content, valid response
      }
    } else if (isDryRun) {
      console.log(`
\x1b[37m\x1b[1m Scrape first time for ${postUrl.split("/").pop()}
`);
    }

    for (const album of albums) {
      const {
        artist,
        title,
        imageUrl,
        imageHeight,
        imageWidth,
        releaseDate,
        tracks,
        spotifyAlbumUrl,
        spotifyAlbumId,
      } = album;

      if (isDryRun) {
        console.log("");
        console.log(`\x1b[37m \x1b[1m🚀 Dry run!\x1b[22m`);
        console.log(`\x1b[37m  Create album:\x1b[22m`);
        console.log(`\x1b[32m  album:  ${title}\x1b[39m`);
        console.log(`\x1b[32m  artist: ${artist}\x1b[39m`);
        console.log(`\x1b[32m  releaseDate: ${releaseDate}\x1b[39m`);
        console.log(`\x1b[32m  track title: ${tracks[0].title}\x1b[39m`);
        console.log(`\x1b[32m  track url: ${tracks[0].preview_url}\x1b[39m`);
        console.log(`\x1b[32m  image url: ${imageUrl}\x1b[39m`);
        console.log(`\x1b[32m  image height: ${imageHeight}\x1b[39m`);
        console.log(`\x1b[32m  image width: ${imageWidth}\x1b[39m`);
        console.log(`\x1b[32m  spotifyAlbumUrl: ${spotifyAlbumUrl}\x1b[39m`);
        console.log(`\x1b[32m  spotifyAlbumId: ${spotifyAlbumId}\x1b[39m`);
        console.log(`\x1b[37m  Create listing:\x1b[22m`);
        console.log(`\x1b[32m  postDate: ${postDate}\x1b[39m`);
        console.log(`\x1b[32m  nprPostUrl: ${postUrl}\x1b[39m`);
        continue; // Skip DB operations
      }

      // 3. Insert image
      const imageId = await createImage({ imageUrl, imageHeight, imageWidth });

      // 4. Insert album with imageId
      const albumId = await createAlbum(
        artist,
        title,
        releaseDate,
        imageId,
        spotifyAlbumId,
        spotifyAlbumUrl
      );

      // 5. Insert listing (blog post) and associate album with listing
      const listingId = await createListing(postDate, postUrl);
      await associateAlbumWithListing(listingId, albumId);

      // 6. Insert tracks for the album
      for (const track of tracks) {
        const { title, preview_url } = track;
        await createTrack(title, preview_url || "", albumId);
      }
    }

    if (!isDryRun) {
      await insertScrapedPost(postUrl);
      console.log(`Success inserting albums from ${postUrl}`);
    } else {
      console.log("");
      console.log(
        `\x1b[1m\x1b[32m✔ Would have inserted albums from ${postUrl.split("/").pop()}!\x1b[22m\x1b[37m`
      );
      console.log("");
    }
    return NextResponse.json({ message: "Albums processed successfully" });
  } catch (error) {
    console.error("Error processing albums:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
