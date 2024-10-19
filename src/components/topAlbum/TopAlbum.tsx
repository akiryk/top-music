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
    return {
      bio: data.artist?.bio?.summary?.replace(/<a\b[^>]*>(.*?)<\/a>/gi, ""),
      link: data.artist?.bio?.links?.link?.href,
    };
  } catch (error) {
    console.error("Error fetching artist info:", error);
    return {};
  }
}

export default async function TopAlbum({ album }: Props) {
  const { bio, link } = await getArtistInfo(album.artist, album.albumTitle);
  return (
    <div className={styles.wrapper}>
      <div className={styles.albumWrapper}>
        <div className={styles.imageWrapper}>
          <a href={album.spotifyAlbumUrl} className={styles.link}>
            <Image
              src={album.imageUrl}
              alt={`${album.albumTitle} cover art`}
              width={640}
              height={640}
              className={styles.albumImage}
            />
          </a>
        </div>

        <div className={styles.albumMeta}>
          <div className={styles.artistName}>{album.artist}</div>
          {album.spotifyAlbumUrl ? (
            <span>
              <a href={album.spotifyAlbumUrl} className={styles.albumNameLink}>
                {album.albumTitle}
              </a>{" "}
              <span className={styles.citation}>(spotify).</span>
            </span>
          ) : (
            <span className={styles.albumName}>{album.albumTitle}.</span>
          )}

          {!album.hasPreviewTracks && <p>No preview tracks available</p>}
          <div className={styles.releaseDate}>
            Release: {album.releaseDate},{" "}
            {album.postUrl && (
              <a className={styles.nprLink} href={album.postUrl}>
                See NPR Post
              </a>
            )}
          </div>
        </div>
      </div>
      {bio && (
        <div className={styles.bioWrapper}>
          {bio}{" "}
          {link ? (
            <span>
              (See{" "}
              <a href={link} className={styles.linkCitation}>
                last.fm
              </a>{" "}
              for more.)
            </span>
          ) : (
            <span className={styles.citation}>last.fm.</span>
          )}
        </div>
      )}
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
