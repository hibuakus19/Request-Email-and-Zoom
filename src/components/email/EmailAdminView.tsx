import { MailIcon } from "@/components/icons";
import AdminRequestView from "@/components/shared/AdminRequestView";
import type { RequestTableColumn } from "@/components/shared/RequestTable";
import { StatusBadge } from "@/components/ui";
import {
  formatDateTime,
  getAvatarTone,
  getInitials,
} from "@/lib/tickets/format";
import type {
  EmailTicketView,
  ServiceResult,
  TicketListPage,
  TicketListQuery,
} from "@/lib/tickets/types";
import EmailTicketEditor from "./EmailTicketEditor";

type EmailAdminViewProps = {
  result: ServiceResult<TicketListPage<EmailTicketView>>;
  query: TicketListQuery;
};

const columns: RequestTableColumn<EmailTicketView>[] = [
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
        <span className="break-all">{row.karyawan.email}</span>
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
    key: "request",
    header: "Jenis Request",
    mobile: "field",
    cell: (row) => <StatusBadge value={row.request} kind="request" />,
  },
  {
    key: "status",
    header: "Status",
    mobile: "field",
    cell: (row) => <StatusBadge value={row.status} />,
  },
  {
    key: "createdAt",
    header: "Tanggal Pengajuan",
    mobile: "field",
    cell: (row) => (
      <span className="whitespace-nowrap">{formatDateTime(row.createdAt)}</span>
    ),
    className: "text-small",
  },
  {
    key: "actions",
    header: "Aksi",
    mobile: "actions",
    cell: (row) => <EmailTicketEditor ticket={row} />,
    headerClassName: "text-left",
    className: "text-left",
  },
];

export default function EmailAdminView({ result, query }: EmailAdminViewProps) {
  return (
    <AdminRequestView
      basePath="/home/email"
      pageTitle="Request Email"
      pageDescription="Pantau seluruh pengajuan email dari karyawan, termasuk jenis request, status, dan waktu pengajuan."
      sectionTitle="Daftar pengajuan email"
      sectionSubtitle="Seluruh request dari karyawan"
      icon={MailIcon}
      tone="accent"
      caption="Daftar pengajuan email karyawan"
      minWidthClassName="min-w-[1220px]"
      emptyTitle="Belum ada pengajuan email"
      emptyMessage="Pengajuan email dari karyawan akan muncul di sini setelah dikirim."
      columns={columns}
      result={result}
      query={query}
    />
  );
}
