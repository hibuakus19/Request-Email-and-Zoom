import { TICKET_STATUSES } from "@/lib/tickets/constants";
import { formatTicketStatus } from "@/lib/tickets/format";
import { buttonClassName } from "@/components/ui/Button";

type AdminToolbarProps = {
  basePath: string;
  searchValue: string;
  statusValue: string | null;
};

const filterLabelClassName =
  "block text-eyebrow font-semibold uppercase tracking-[0.12em] text-muted";
const controlClassName =
  "mt-1.5 block h-11 w-full rounded-xl border border-line-strong bg-white px-3 text-body-sm font-medium text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";

/**
 * Server-rendered search and status filter for the admin request tables.
 * Submitted as a plain GET form so filtering re-renders on the server with a
 * fresh database query — no client state is involved.
 */
export default function AdminToolbar({
  basePath,
  searchValue,
  statusValue,
}: AdminToolbarProps) {
  return (
    <form
      method="get"
      action={basePath}
      role="search"
      className="flex flex-col gap-3 border-b border-line bg-paper/60 px-4 py-4 sm:px-5 md:flex-row md:items-end"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={`${basePath}-search`} className={filterLabelClassName}>
          Cari nama / NIP
        </label>
        <input
          id={`${basePath}-search`}
          type="search"
          name="q"
          defaultValue={searchValue}
          maxLength={100}
          placeholder="Contoh: Budi atau 12345"
          className={controlClassName}
        />
      </div>

      <div className="w-full md:w-52">
        <label htmlFor={`${basePath}-status`} className={filterLabelClassName}>
          Status
        </label>
        <select
          id={`${basePath}-status`}
          name="status"
          defaultValue={statusValue ?? ""}
          className={controlClassName}
        >
          <option value="">Semua status</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatTicketStatus(status).label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 md:pb-0.5">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-label font-semibold text-white shadow-sm transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Terapkan
        </button>
        <a
          href={basePath}
          className={buttonClassName({ variant: "secondary", size: "md" })}
        >
          Reset
        </a>
      </div>
    </form>
  );
}
