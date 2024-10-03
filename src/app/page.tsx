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
            <div className={styles.details}>
              <span>Artist:</span> <span>{album.artist}</span>
            </div>
            <div className={styles.details}>
              <span>Album:</span>
              <span>{album.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
