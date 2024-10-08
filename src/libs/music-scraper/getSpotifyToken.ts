import axios from "axios";

export async function getSpotifyToken() {
  const tokenUrl =
    process.env.SPOTIFY_TOKEN_URL || "https://accounts.spotify.com/api/token";
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    throw new Error("Missing spotify credentials: no secret or id");
  }
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      tokenUrl,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token; // This is your access token
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
  }
}
