import Link from "next/link";
import styles from "./Paginator.module.css";

type Props = {
  page: number;
  isAnotherPage: boolean;
};

export default function Pagination({ page, isAnotherPage }: Props) {
  const isPageOne = page === 1;
  const isDisabled = isPageOne;
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
      {!isPageOne && (
        <Link
          href={`/?page=1`}
          className={isDisabled ? styles.linkDisabled : styles.link}
          aria-disabled={isDisabled}
          tabIndex={isDisabled ? -1 : undefined}
        >
          Return to 1
        </Link>
      )}
      <Link
        className={isAnotherPage ? styles.link : styles.linkDisabled}
        href={`/?page=${page + 1}`}
      >
        Next 5
      </Link>
    </div>
  );
}
