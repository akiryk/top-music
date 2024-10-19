import { sql } from "@vercel/postgres";
import type { DisplayAlbum, AlbumFromDatabase } from "@/types";

// Create an album with artist, title, release date, and image id
export async function createAlbum(
  artist: string,
  title: string,
  releaseDate: string, // the database can handle converting YYYY-MM-DD to DATE format
  imageId: number,
  spotifyAlbumId: string,
  spotifyAlbumUrl: string
) {
  await sql`
    INSERT INTO albums (
      artist,
      title,
      release_date,
      image_id,
      spotify_album_id,
      spotify_album_url
    )
    VALUES (
      ${artist},
      ${title},
      ${releaseDate},
      ${imageId},
      ${spotifyAlbumId},
      ${spotifyAlbumUrl}
    )
  `;

  const { rows: lastInsertId } =
    await sql`SELECT currval(pg_get_serial_sequence('albums','id'))`;

  const albumId = lastInsertId[0].currval;
  return albumId;
}

// Create an image
export async function createImage({
  imageUrl,
  imageHeight = 640,
  imageWidth = 640,
}: {
  imageUrl: string;
  imageHeight: number;
  imageWidth: number;
}) {
  await sql`
    INSERT INTO images (url, height, width)
    VALUES (${imageUrl}, ${imageHeight}, ${imageWidth});
  `;

  const { rows: lastInsertId } =
    await sql`SELECT currval(pg_get_serial_sequence('images','id'))`;

  const imageId = lastInsertId[0].currval;
  return imageId;
}

// Create a track and associate it with an album
export async function createTrack(
  title: string,
  preview_url: string | undefined,
  albumId: number
) {
  await sql`INSERT INTO tracks(title, preview_url, album_id) VALUES (${title}, ${preview_url}, ${albumId})`;

  const { rows: lastInsertId } =
    await sql`SELECT currval(pg_get_serial_sequence('tracks','id'))`;

  const trackId = lastInsertId[0].currval;
  return trackId;
}

// Create a listing (blog post)
export async function createListing(postDate: string, url: string) {
  await sql`INSERT INTO listings(post_date, url) VALUES (${postDate}, ${url})`;

  const { rows: lastInsertId } =
    await sql`SELECT currval(pg_get_serial_sequence('listings','id'))`;

  const listingId = lastInsertId[0].currval;
  return listingId;
}

// Associate an album with a listing
export async function associateAlbumWithListing(
  listingId: number,
  albumId: number
) {
  await sql`INSERT INTO listing_albums(listing_id, album_id) VALUES (${listingId}, ${albumId})`;
}

// Fetch all albums with details, including pagination
export async function getAlbums(
  limit = 5,
  offset = 0
): Promise<Array<DisplayAlbum>> {
  const result = await sql`
    SELECT
      a.id,
      a.artist,
      a.title AS album_title,
      a.release_date,
      a.spotify_album_id,
      a.spotify_album_url,
      i.url AS image_url,
      i.height AS image_height,
      i.width AS image_width,
      l.post_date,
      l.url AS listing_url,
      array_agg(json_build_object('title', t.title, 'preview_url', t.preview_url)) AS tracks
    FROM
      albums AS a
    LEFT JOIN
      images AS i ON a.image_id = i.id
    LEFT JOIN
      listing_albums AS la ON a.id = la.album_id
    LEFT JOIN
      listings AS l ON la.listing_id = l.id
    LEFT JOIN
      tracks AS t ON a.id = t.album_id
    GROUP BY
      a.id, i.url, i.height, i.width, l.post_date, l.url
    ORDER BY
      a.release_date DESC
    LIMIT ${limit} OFFSET ${offset};
`;

  const albums: AlbumFromDatabase[] = result.rows as AlbumFromDatabase[];

  const displayAlbums: DisplayAlbum[] = albums.map(
    (album: AlbumFromDatabase): DisplayAlbum => ({
      albumTitle: album.album_title,
      artist: album.artist,
      id: album.id.toString(),
      imageHeight: album.image_height,
      imageUrl: album.image_url,
      imageWidth: album.image_width,
      postDate: album.post_date.toISOString().split("T")[0],
      postUrl: album.listing_url,
      releaseDate: album.release_date.toISOString().split("T")[0],
      spotifyAlbumUrl: album.spotify_album_url,
      spotifyAlbumId: album.spotify_album_id,
      tracks: album.tracks || [], // Will be an empty array if no tracks
      hasPreviewTracks: album.tracks?.every((track) => track.preview_url),
    })
  );

  return displayAlbums;
}

export async function insertScrapedPost(postUrl: string) {
  await sql`INSERT INTO scraped_posts (post_url) VALUES (${postUrl})`;
}

export async function postAlreadyScraped(postUrl: string): Promise<boolean> {
  const result =
    await sql`SELECT post_url FROM scraped_posts WHERE post_url = ${postUrl}`;
  return result.rows.length > 0; // If the result has rows, the post has already been scraped
}
