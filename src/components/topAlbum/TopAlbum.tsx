import Link from "next/link";
import Image from "next/image";
import type { DisplayAlbum } from "@/types";
import styles from "./TopAlbum.module.css";

type Props = {
  album: DisplayAlbum;
};

export default function TopAlbum({ album }: Props) {
  return (
    <div className={styles.topAlbumLayout}>
      <div className={styles.albumWrapper}>
        <div className={styles.albumDetails}>
          <div className={styles.releaseDate}>Release: {album.releaseDate}</div>
          <div className={styles.link}>
            <Link href={album.listingUrl}>See NPR Post</Link>
          </div>
          <div className={styles.imageWrapper}>
            <Link href={album.albumUrl} className={styles.link}>
              <Image
                src={album.imageUrl}
                alt={`${album.title} cover art`}
                width={640}
                height={640}
                className={styles.albumImage}
              />
            </Link>
          </div>
          <div className={styles.artistName}>{album.artist}</div>
          <div className={styles.albumName}>{album.title}</div>
        </div>
        <div className={styles.tracksWrapper}>
          {album.hasPreviewTracks ? (
            <ul className={styles.trackList}>
              {album.tracks.map((track, trackIndex) => (
                <li key={trackIndex} className={styles.trackItem}>
                  <div className={styles.trackDetails}>
                    <span>{track.title}</span>
                  </div>
                  {track.preview_url && (
                    <div className={styles.sampleWrapper}>
                      <audio controls>
                        <source src={track.preview_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No tracks.{" "}
              <Link href={album.albumUrl} className={styles.link}>
                See {album.title}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
