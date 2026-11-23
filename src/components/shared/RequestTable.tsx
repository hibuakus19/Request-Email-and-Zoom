import type { ReactNode } from "react";

export type RequestTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /**
   * How the column is rendered in the mobile card list.
   * - title: prominent title row
   * - field / block: label above a left-aligned value
   * - actions: shown last in the mobile card, after every other field
   * - hidden: desktop-only column
   */
  mobile?: "title" | "field" | "block" | "actions" | "hidden";
};

type RequestTableProps<T> = {
  rows: T[];
  columns: RequestTableColumn<T>[];
  getRowId: (row: T) => string | number;
  caption: string;
  emptyState: ReactNode;
  minWidthClassName?: string;
};

export default function RequestTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  emptyState,
  minWidthClassName = "min-w-[960px]",
}: RequestTableProps<T>) {
  if (rows.length === 0) {
    return <>{emptyState}</>;
  }

  const visibleMobileColumns = columns.filter(
    (column) => (column.mobile ?? "field") !== "hidden",
  );
  const mobileModeOf = (column: RequestTableColumn<T>) =>
    column.mobile ?? "field";
  const mobileColumns = [
    ...visibleMobileColumns.filter((c) => mobileModeOf(c) === "title"),
    ...visibleMobileColumns.filter((c) => {
      const mode = mobileModeOf(c);
      return mode !== "title" && mode !== "actions";
    }),
    ...visibleMobileColumns.filter((c) => mobileModeOf(c) === "actions"),
  ];

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table
          className={`w-full ${minWidthClassName} border-collapse text-left`}
        >
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line bg-paper/75">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-5 py-3 text-eyebrow font-bold uppercase tracking-[0.12em] text-muted ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/80">
            {rows.map((row) => (
              <tr
                key={getRowId(row)}
                className="bg-white transition-colors duration-150 hover:bg-paper/55"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 align-middle text-body-sm text-ink-soft ${column.className ?? ""}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line/80 lg:hidden">
        {rows.map((row) => (
          <li key={getRowId(row)} className="bg-white px-4 py-4 sm:px-5">
            <dl className="space-y-3">
              {mobileColumns.map((column) => {
                const mobileMode = column.mobile ?? "field";

                if (mobileMode === "title") {
                  return <div key={column.key}>{column.cell(row)}</div>;
                }

                return (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-micro font-bold uppercase tracking-[0.12em] text-muted">
                      {column.header}
                    </dt>
                    <dd className="mt-1 break-words text-left text-body-sm text-ink-soft">
                      {column.cell(row)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
