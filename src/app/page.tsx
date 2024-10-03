// import albums from "@/assets/new-music.json";
import { getAlbums } from "@/db/index";
import styles from "./page.module.css";

export default async function Home() {
  const albums = await getAlbums();
  return (
    <main className="mx-8 my-8">
      <h1>New Music Albums from DB!</h1>
      <ul>
        {albums.map((album, index) => (
          <li key={index} className={styles.listing}>
            <div className={styles.albumWrapper}>
              <div className={styles.sampleWrapper}>
                <audio controls>
                  <source
                    src="https://p.scdn.co/mp3-preview/3fadd9244f0c71bd5a211dfd6486e5e1e27838a2?cid=6431a5b9511d410384a437ba92cd36a3"
                    type="audio/mpeg"
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className={styles.details}>
                <span>Artist:</span> <span>{album.artist}</span>
                <span>Album:</span>
                <span>{album.title}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
