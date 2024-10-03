import { createAlbum } from "@/db/index";
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
      const { artist, title } = album;
      const albumId = await createAlbum(artist, title);
      console.log(`Inserted album ${title} by ${artist}, ID: ${albumId}`);
    }
    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
