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

    const { albumsWithSongs: albums, latestPostURL } = data;

    // 2. Check if the post has already been scraped
    const isScraped = await postAlreadyScraped(latestPostURL);
    if (isScraped) {
      console.log("");
      console.log(
        `\x1b[1m\x1b[31m Post from ${latestPostURL.split("/").pop()} was already scraped.`
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
\x1b[37m\x1b[1m Scrape first time for ${latestPostURL.split("/").pop()}
`);
    }

    for (const album of albums) {
      const {
        artist,
        title,
        postDate,
        image: { url },
        releaseDate,
        tracks,
      } = album;

      if (isDryRun) {
        console.log(`\x1b[37m \x1b[1m🚀 Dry run would insert:\x1b[22m`);
        console.log(`\x1b[32m  album:  ${title}\x1b[39m`);
        console.log(`\x1b[32m  artist: ${artist}\x1b[39m`);
        console.log(`\x1b[32m  tracks: ${tracks[0].name}\x1b[39m`);
        continue; // Skip DB operations
      }

      // 3. Insert image
      const imageId = await createImage(url);

      // 4. Insert album with imageId
      const albumId = await createAlbum(artist, title, releaseDate, imageId);

      // 5. Insert listing (blog post) and associate album with listing
      const listingId = await createListing(postDate, url);
      await associateAlbumWithListing(listingId, albumId);

      // 6. Insert tracks for the album
      for (const track of tracks) {
        const { name, preview_url } = track;
        await createTrack(name, preview_url || "", albumId);
      }
    }

    if (!isDryRun) {
      await insertScrapedPost(latestPostURL);
      console.log(`Success inserting albums from ${latestPostURL}`);
    } else {
      console.log("");
      console.log(
        `\x1b[1m\x1b[32m✔ Would have inserted albums from ${latestPostURL.split("/").pop()}!\x1b[22m\x1b[37m`
      );
      console.log("");
    }
    return NextResponse.json({ message: "Albums processed successfully" });
  } catch (error) {
    console.error("Error processing albums:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
