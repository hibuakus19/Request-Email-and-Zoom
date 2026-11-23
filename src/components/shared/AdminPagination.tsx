import Link from "next/link";
import { buildTicketListHref } from "@/lib/validation/tickets";
import type { TicketListQuery } from "@/lib/tickets/types";

type AdminPaginationProps = {
  basePath: string;
  query: TicketListQuery;
  page: number;
  total: number;
};

const linkClassName =
  "inline-flex h-10 items-center rounded-lg border border-line bg-white px-3.5 text-small font-semibold text-ink-soft transition hover:border-accent/30 hover:bg-accent-soft hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const disabledClassName =
  "inline-flex h-10 items-center rounded-lg border border-line bg-paper-deep/60 px-3.5 text-small font-semibold text-muted";

/**
 * Server-rendered pagination for the admin request tables. Links preserve the
 * active search and status filter while moving between pages.
 */
export default function AdminPagination({
  basePath,
  query,
  page,
  total,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

  if (total === 0) {
    return null;
  }

  const firstRow = (page - 1) * query.pageSize + 1;
  const lastRow = Math.min(page * query.pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-col gap-3 border-t border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <p className="text-caption text-muted">
        Menampilkan{" "}
        <span className="font-semibold text-ink-soft">
          {firstRow}–{lastRow}
        </span>{" "}
        dari <span className="font-semibold text-ink-soft">{total}</span>{" "}
        pengajuan
      </p>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildTicketListHref(basePath, query, page - 1)}
            className={linkClassName}
          >
            Sebelumnya
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClassName}>
            Sebelumnya
          </span>
        )}
        <span className="text-caption font-semibold text-ink-soft">
          Halaman {page} / {totalPages}
        </span>
        {hasNext ? (
          <Link
            href={buildTicketListHref(basePath, query, page + 1)}
            className={linkClassName}
          >
            Berikutnya
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClassName}>
            Berikutnya
          </span>
        )}
      </div>
    </nav>
  );
}
