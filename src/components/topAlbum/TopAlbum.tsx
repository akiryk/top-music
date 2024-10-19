import Link from "next/link";
import Image from "next/image";
import type { DisplayAlbum } from "@/types";
import styles from "./TopAlbum.module.css";

type Props = {
  album: DisplayAlbum;
};

async function getArtistInfo(artist: string, album: string) {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=${process.env.LAST_FM_KEY}&artist=${artist}&album=${album}&format=json`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.artist?.bio?.summary?.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "");
  } catch (error) {
    console.error("Error fetching artist info:", error);
    return;
  }
}

export default async function TopAlbum({ album }: Props) {
  const bio = await getArtistInfo(album.artist, album.albumTitle);
  return (
    <div className={styles.wrapper}>
      <div className={styles.albumWrapper}>
        <div className={styles.imageWrapper}>
          <Link href={album.spotifyAlbumUrl} className={styles.link}>
            <Image
              src={album.imageUrl}
              alt={`${album.albumTitle} cover art`}
              width={640}
              height={640}
              className={styles.albumImage}
            />
          </Link>
        </div>

        <div className={styles.albumMeta}>
          <div className={styles.artistName}>{album.artist}</div>
          {album.spotifyAlbumUrl ? (
            <Link href={album.spotifyAlbumUrl} className={styles.albumNameLink}>
              {album.albumTitle}.
            </Link>
          ) : (
            <span className={styles.albumName}>{album.albumTitle}.</span>
          )}

          {!album.hasPreviewTracks && <p>No preview tracks available</p>}
          <div className={styles.releaseDate}>
            Release: {album.releaseDate},{" "}
            {album.postUrl && (
              <Link className={styles.nprLink} href={album.postUrl}>
                See NPR Post
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className={styles.bioWrapper}>{bio}</div>
      {album.hasPreviewTracks && (
        <div className={styles.tracksWrapper}>
          <ul className={styles.trackList}>
            {album.tracks.map((track, trackIndex) => (
              <li key={trackIndex} className={styles.trackItem}>
                {track.title && (
                  <div className={styles.trackName}>
                    <span>{track.title.toLowerCase()}</span>
                  </div>
                )}
                {track.preview_url && (
                  <div className={styles.sampleWrapper}>
                    <audio controls className={styles.audio}>
                      <source src={track.preview_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
