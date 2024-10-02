import data from "@/assets/new-music.json";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className="mx-8 my-8">
      <h1>New Music Albums</h1>
      <ul>
        {data.map((album, index) => (
          <li key={index} className={styles.listing}>
            <div className={styles.details}>
              <span>Artist:</span> <span>{album.artist}</span>
            </div>
            <div className={styles.details}>
              <span>Album:</span>
              <span>{album.album}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
