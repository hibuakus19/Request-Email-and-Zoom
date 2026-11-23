import type { ComponentType } from "react";
import { Alert, EmptyState, PageHeader } from "@/components/ui";
import RefreshButton from "@/components/ui/RefreshButton";
import type {
  ServiceResult,
  TicketListPage,
  TicketListQuery,
} from "@/lib/tickets/types";
import AdminPagination from "./AdminPagination";
import AdminToolbar from "./AdminToolbar";
import RequestTable, { type RequestTableColumn } from "./RequestTable";

type AdminRequestViewProps<T extends { id: number }> = {
  basePath: string;
  pageTitle: string;
  pageDescription: string;
  sectionTitle: string;
  sectionSubtitle: string;
  icon: ComponentType<{ size?: number }>;
  tone: "accent" | "success";
  caption: string;
  minWidthClassName: string;
  emptyTitle: string;
  emptyMessage: string;
  columns: RequestTableColumn<T>[];
  result: ServiceResult<TicketListPage<T>>;
  query: TicketListQuery;
};

const toneStyles = {
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-success-soft text-success",
} as const;

export default function AdminRequestView<T extends { id: number }>({
  basePath,
  pageTitle,
  pageDescription,
  sectionTitle,
  sectionSubtitle,
  icon: Icon,
  tone,
  caption,
  minWidthClassName,
  emptyTitle,
  emptyMessage,
  columns,
  result,
  query,
}: AdminRequestViewProps<T>) {
  const rows = result.ok ? result.data.rows : [];
  const total = result.ok ? result.data.total : 0;
  const isFiltered = Boolean(query.search || query.status);

  // Aksi ditaruh paling kiri agar tombol Kelola langsung terlihat tanpa
  // harus menggeser tabel yang lebar.
  const orderedColumns = [
    ...columns.filter((column) => column.key === "actions"),
    ...columns.filter((column) => column.key !== "actions"),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-8 sm:px-8 sm:pt-5 sm:pb-10 lg:px-10 lg:pt-6 lg:pb-12">
      <PageHeader
        eyebrow="Administrasi"
        title={pageTitle}
        description={pageDescription}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-caption font-semibold text-ink-soft">
              {result.ok ? `${total} pengajuan` : "Gagal dimuat"}
            </span>
            <RefreshButton />
          </div>
        }
        className="animate-rise-in"
      />

      {!result.ok ? (
        <Alert tone="error" title="Gagal memuat data" className="mt-6">
          {result.error.message} Silakan muat ulang halaman untuk mencoba lagi.
          Jika masalah berlanjut, hubungi administrator.
        </Alert>
      ) : null}

      <section className="animate-rise-in mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-line bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl ${toneStyles[tone]}`}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="text-body font-semibold tracking-[-0.01em] text-ink">
                {sectionTitle}
              </h2>
              <p className="mt-0.5 text-caption text-muted">
                {sectionSubtitle}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-eyebrow font-semibold text-muted">
            <Icon size={13} />
            {result.ok ? `${total} baris` : "Gagal dimuat"}
          </span>
        </div>

        {result.ok ? (
          <AdminToolbar
            basePath={basePath}
            searchValue={query.search}
            statusValue={query.status}
          />
        ) : null}

        <RequestTable
          rows={rows}
          columns={orderedColumns}
          getRowId={(row) => row.id}
          caption={caption}
          minWidthClassName={minWidthClassName}
          emptyState={
            result.ok ? (
              <EmptyState
                title={emptyTitle}
                description={
                  isFiltered
                    ? "Tidak ada pengajuan yang cocok dengan pencarian atau filter. Coba ubah kata kunci atau reset filter."
                    : emptyMessage
                }
              />
            ) : (
              <EmptyState
                title="Gagal memuat data"
                description="Daftar pengajuan belum dapat dimuat. Silakan muat ulang halaman untuk mencoba lagi, atau hubungi administrator jika masalah berlanjut."
              />
            )
          }
        />

        {result.ok ? (
          <AdminPagination
            basePath={basePath}
            query={query}
            page={result.data.page}
            total={result.data.total}
          />
        ) : null}
      </section>
    </div>
  );
}
