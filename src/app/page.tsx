import Link from "next/link";
import { getAlbums } from "@/db/index";
import Pagination from "@/components/Paginator";
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
      <h1 className={styles.pageTitle}>
        New Music Albums from{" "}
        <Link
          className={styles.link}
          href="https://www.npr.org/sections/allsongs/606254804/new-music-friday"
        >
          NPR New Music Friday
        </Link>
      </h1>
      <div className={styles.pagination}>
        <Pagination page={page} />
      </div>
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
