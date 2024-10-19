import { getAlbums } from "@/db/index";
import Link from "next/link";
import Pagination from "@/components/Paginator";
import TopAlbum from "@/components/topAlbum";

import styles from "./page.module.css";

type PageProps = {
  searchParams: { page: string };
};

export default async function Home({ searchParams }: PageProps) {
  try {
    const page = parseInt(searchParams.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const { displayAlbums: albums, total } = await getAlbums(limit, offset);
    const isAnotherPage = offset + limit < total;
    if (albums.length === 0) {
      throw Error();
    }
    return (
      <>
        <div className={styles.pagination}>
          <Pagination page={page} isAnotherPage={isAnotherPage} />
        </div>
        <ul>
          {albums.map((album) => (
            <li key={album.id} className={styles.listing}>
              <TopAlbum album={album} />
            </li>
          ))}
        </ul>
        <Pagination page={page} isAnotherPage={isAnotherPage} />
      </>
    );
  } catch {
    return (
      <>
        <p>Oops, unable to load albums on this page.</p>
        <p>
          Maybe try again? Or{" "}
          <Link href="/" className={styles.link}>
            return home?
          </Link>
        </p>
      </>
    );
  }
}
