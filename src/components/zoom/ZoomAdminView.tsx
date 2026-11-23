import { ExternalLinkIcon, VideoIcon } from "@/components/icons";
import AdminRequestView from "@/components/shared/AdminRequestView";
import type { RequestTableColumn } from "@/components/shared/RequestTable";
import { StatusBadge } from "@/components/ui";
import {
  formatEventDateTime,
  getAvatarTone,
  getInitials,
  isHttpUrl,
} from "@/lib/tickets/format";
import type {
  ServiceResult,
  TicketListPage,
  TicketListQuery,
  ZoomTicketView,
} from "@/lib/tickets/types";
import ZoomTicketEditor from "./ZoomTicketEditor";

type ZoomAdminViewProps = {
  result: ServiceResult<TicketListPage<ZoomTicketView>>;
  query: TicketListQuery;
};

const columns: RequestTableColumn<ZoomTicketView>[] = [
  {
    key: "nama",
    header: "Nama Karyawan",
    mobile: "title",
    cell: (row) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full text-eyebrow font-bold ring-1 ${getAvatarTone(row.nip)}`}
        >
          {getInitials(row.karyawan.nama)}
        </span>
        <span className="min-w-0 truncate font-semibold text-ink">
          {row.karyawan.nama}
        </span>
      </div>
    ),
  },
  {
    key: "nip",
    header: "NIP",
    mobile: "field",
    cell: (row) => (
      <span className="font-mono text-caption text-ink-soft">{row.nip}</span>
    ),
  },
  {
    key: "email",
    header: "Email",
    mobile: "block",
    cell: (row) =>
      row.karyawan.email ? (
        <span
          title={row.karyawan.email}
          className="block max-w-[240px] truncate"
        >
          {row.karyawan.email}
        </span>
      ) : (
        <span className="text-muted">Belum ada email</span>
      ),
  },
  {
    key: "bagian",
    header: "Divisi / Bagian",
    mobile: "field",
    cell: (row) => row.karyawan.bagian ?? <span className="text-muted">—</span>,
  },
  {
    key: "description",
    header: "Deskripsi Meeting",
    mobile: "block",
    cell: (row) => (
      <p
        title={row.description}
        className="text-body-sm leading-relaxed text-ink-soft lg:line-clamp-2 lg:max-w-[260px]"
      >
        {row.description}
      </p>
    ),
  },
  {
    key: "date",
    header: "Tanggal & Waktu Acara",
    mobile: "field",
    cell: (row) => (
      <span className="whitespace-nowrap">{formatEventDateTime(row.date)}</span>
    ),
    className: "text-small",
  },
  {
    key: "status",
    header: "Status",
    mobile: "field",
    cell: (row) => <StatusBadge value={row.status} />,
  },
  {
    key: "zoomLink",
    header: "Zoom Link",
    mobile: "block",
    cell: (row) =>
      row.zoomLink ? (
        <a
          href={row.zoomLink}
          target="_blank"
          rel="noreferrer noopener"
          title={row.zoomLink}
          className="inline-flex max-w-[220px] items-center gap-1.5 text-small font-semibold text-info hover:underline"
        >
          <span className="truncate">{row.zoomLink}</span>
          <ExternalLinkIcon size={13} className="shrink-0" />
        </a>
      ) : (
        <span className="text-muted">Belum diisi</span>
      ),
  },
  {
    key: "linkSurat",
    header: "Surat Perintah",
    mobile: "block",
    cell: (row) =>
      row.linkSurat && isHttpUrl(row.linkSurat) ? (
        <a
          href={row.linkSurat}
          target="_blank"
          rel="noreferrer noopener"
          title={row.linkSurat}
          className="inline-flex max-w-[220px] items-center gap-1.5 text-small font-semibold text-info hover:underline"
        >
          <span className="truncate">Buka surat</span>
          <ExternalLinkIcon size={13} className="shrink-0" />
        </a>
      ) : (
        <span className="text-muted">
          {row.linkSurat ? "Tautan tidak valid" : "Belum diisi"}
        </span>
      ),
  },
  {
    key: "actions",
    header: "Aksi",
    mobile: "actions",
    cell: (row) => <ZoomTicketEditor ticket={row} />,
    headerClassName: "text-left",
    className: "text-left",
  },
];

export default function ZoomAdminView({ result, query }: ZoomAdminViewProps) {
  return (
    <AdminRequestView
      basePath="/home/zoom"
      pageTitle="Request Zoom"
      pageDescription="Kelola pengajuan ruang Zoom: pantau detail acara, perbarui tautan, dan sesuaikan status tiket."
      sectionTitle="Daftar pengajuan Zoom"
      sectionSubtitle="Detail acara, tautan, dan status tiket"
      icon={VideoIcon}
      tone="success"
      caption="Daftar pengajuan Zoom karyawan"
      minWidthClassName="min-w-[1320px]"
      emptyTitle="Belum ada pengajuan Zoom"
      emptyMessage="Pengajuan Zoom dari karyawan akan muncul di sini setelah dikirim."
      columns={columns}
      result={result}
      query={query}
    />
  );
}
