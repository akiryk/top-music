import SpotifyWebApi from "spotify-web-api-node";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

// Initialize the Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Function to retrieve a preview URL for a specific track
async function getSpotifySample() {
  console.log(`process.env.SPOTIFY_CLIENT_ID ${process.env.SPOTIFY_CLIENT_ID}`);
  try {
    // Retrieve an access token
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);

    // Example: Get a sample for a specific track (replace with desired track)
    const trackId = "3QDU1ktosSk7kX7oIlHThz"; // Hardcoded example track ID
    const response = await spotifyApi.getTrack(trackId);

    // Log the preview URL
    const previewUrl = response.body.preview_url;
    if (previewUrl) {
      console.log(`Preview URL: ${previewUrl}`);
    } else {
      console.log("No preview available for this track.");
    }
  } catch (error) {
    console.error("Error retrieving Spotify sample:", error);
  }
}

// Run the function
getSpotifySample();
