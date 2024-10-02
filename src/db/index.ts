import { sql } from "@vercel/postgres";
import type { Album } from "@/types";

export async function createAlbum(artist: string, title: string) {
  await sql`INSERT INTO albums(artist, title) VALUES (${artist}, ${title})`;

  const { rows: lastInsertId } =
    await sql`  SELECT currval(pg_get_serial_sequence('albums','id'))`;

  const albumId = lastInsertId[0].currval;

  return albumId;
}

export async function getAlbum(albumId: number): Promise<Album | null> {
  const { rows: albums } =
    await sql`SELECT * FROM albums WHERE id = ${albumId}`;
  if (!albums[0]) {
    return null;
  }

  return {
    ...albums[0],
  } as Album;
}

export async function getAlbums(): Promise<Album[]> {
  const { rows: albums } = await sql`SELECT * FROM albums`;
  return albums as Album[];
}
