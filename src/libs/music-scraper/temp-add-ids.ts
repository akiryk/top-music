import { sql } from "@vercel/postgres";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

dotenv.config();

const jsonFilePath = path.join(__dirname, "../../assets/new-music.json");

async function updateSpotifyData() {
  try {
    const jsonData = fs.readFileSync(jsonFilePath, "utf-8");
    const albums = JSON.parse(jsonData);

    // Iterate over the albums and update the database
    for (const [index, album] of albums.entries()) {
      const id = index + 1; // Assuming the ID starts at 1 and matches the order in the JSON

      const { spotifyAlbumId, spotifyAlbumUrl, albumTitle } = album;

      // Update the database
      await sql`
        UPDATE albums
        SET
          spotify_album_id = ${spotifyAlbumId},
          spotify_album_url = ${spotifyAlbumUrl}
        WHERE id = ${id};
      `;

      console.log(`Updated album ID ${id}: ${albumTitle}`);
    }

    console.log("Database update complete!");
  } catch (error) {
    console.error("Error updating database:", error);
  }
}

updateSpotifyData();
