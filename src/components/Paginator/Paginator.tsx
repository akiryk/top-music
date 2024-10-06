import Link from "next/link";
import styles from "./Paginator.module.css";

type Props = {
  page: number;
};

export default function Pagination({ page }: Props) {
  const isDisabled = page === 1;
  return (
    <div className={styles.pagination}>
      <Link
        href={`/?page=${page - 1}`}
        className={isDisabled ? styles.linkDisabled : styles.link}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
      >
        Back
      </Link>
      <Link className={styles.link} href={`/?page=${page + 1}`}>
        Next 5
      </Link>
    </div>
  );
}
