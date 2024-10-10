import path from "path";
import fs from "fs";
import type { BasicAlbum } from "./types";

const NEW_MUSIC_FILENAME = "new-music";

export async function saveAlbumsToJSON(albums: BasicAlbum[]) {
  const assetsPath = process.env.ASSETS_PATH || "src/assets";
  const savePath = path.join(
    process.cwd(),
    assetsPath,
    `${NEW_MUSIC_FILENAME}.json`
  );

  // Save the collected albums to a JSON file
  fs.writeFileSync(savePath, JSON.stringify(albums, null, 2));

  console.log("All album data scraped and saved successfully!");
}
