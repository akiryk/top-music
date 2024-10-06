import { getAlbums } from "@/db/index";
import Pagination from "@/components/Pagination";
import TopAlbum from "@/components/topAlbum";

import styles from "./page.module.css";

type PageProps = {
  searchParams: { page: string };
};

export default async function Home({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page) || 1; // Default to page 1
  const limit = 5;
  const offset = (page - 1) * limit;
  const albums = await getAlbums(limit, offset);

  return (
    <main className="mx-8 my-8">
      <h1>New Music Albums from DB!</h1>
      <Pagination page={page} />
      <ul>
        {albums.map((album) => (
          <li key={album.id} className={styles.listing}>
            <TopAlbum album={album} />
          </li>
        ))}
      </ul>
      <Pagination page={page} />
    </main>
  );
}
