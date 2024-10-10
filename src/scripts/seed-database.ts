import {
  createAlbum,
  createImage,
  createTrack,
  createListing,
  associateAlbumWithListing,
} from "@/db/index"; // Import necessary DB functions
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const jsonFilePath = path.join(__dirname, "../../assets/new-music.json");

async function seedDatabase() {
  console.log("Start seeding db!");
  console.log(process.env.POSTGRES_URL);
  try {
    const jsonData = fs.readFileSync(jsonFilePath, "utf-8");
    const albums = JSON.parse(jsonData);

    // insert each album into the db
    for (const album of albums) {
      const { artist, albumTitle, postDate, url, image, releaseDate, tracks } =
        album;

      // 1. Insert image
      const imageId = await createImage(image.url);
      console.log(`Inserted image, ID: ${imageId}`);

      // 2. Insert album with imageId
      const albumId = await createAlbum(
        artist,
        albumTitle,
        releaseDate,
        imageId
      );
      console.log(`Inserted album ${albumTitle} by ${artist}, ID: ${albumId}`);

      // 3. Insert listing (blog post) and associate album with listing
      const listingId = await createListing(postDate, url);
      await associateAlbumWithListing(listingId, albumId);
      console.log(`Inserted listing for album ${albumTitle}, ID: ${listingId}`);

      // 4. Insert tracks for the album
      for (const track of tracks) {
        const { name, preview_url } = track;
        const trackId = await createTrack(name, preview_url, albumId);
        console.log(`Inserted track ${name}, ID: ${trackId}`);
      }
    }
    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
