import { NextResponse } from "next/server";
import { scrapeAlbumsFromLatestPost } from "@/libs/music-scraper"; // Custom functions for scraping
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

  // Check the Authorization header to verify the cron secret
  if (
    req.headers.get("Authorization") !==
    `Bearer ${process.env.VERCEL_CRON_SECRET}`
  ) {
    return new Response(
      `Unauthorized, the secret ${process.env.VERCEL_CRON_SECRET} is wrong`,
      { status: 401 }
    );
  }

  try {
    // 1. Scrape NPR New Music Friday for the latest post
    const data = await scrapeAlbumsFromLatestPost();

    if (!data) {
      console.error("no albums were retrieved by cron job");
      return new Response(null, { status: 204 }); // No content, valid response
    }

    const { albumsWithSongs: albums, latestPostURL } = data;

    // 2. Check if the post has already been scraped
    const isScraped = await postAlreadyScraped(latestPostURL);
    if (isScraped) {
      console.log(
        `Post from ${latestPostURL} was already scraped. Not scraping again.`
      );
      return new Response(null, { status: 204 }); // No content, valid response
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
        console.log(`Dry run: would insert album ${title} by ${artist}`);
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
    }

    return NextResponse.json({ message: "Albums processed successfully" });
  } catch (error) {
    console.error("Error processing albums:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
