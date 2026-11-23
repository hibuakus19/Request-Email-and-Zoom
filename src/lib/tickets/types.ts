import type { TicketStatus } from "./constants";

export type KaryawanSummary = {
  nama: string;
  email: string | null;
  bagian: string | null;
};

/**
 * View model for `email_ticket`. The backend adapter is responsible for
 * joining `karyawan` and serialising dates to ISO strings.
 */
export type EmailTicketView = {
  id: number;
  nip: string;
  request: string;
  status: string;
  createdAt: string;
  karyawan: KaryawanSummary;
};

/**
 * View model for `zoom_ticket`. `date` is the event's local Jakarta date/time
 * represented as `YYYY-MM-DDTHH:mm` (without a timezone offset).
 */
export type ZoomTicketView = {
  id: number;
  nip: string;
  description: string;
  date: string;
  zoomLink: string | null;
  linkSurat: string | null;
  alasanDitolak: string | null;
  status: string;
  createdAt: string;
  karyawan: KaryawanSummary;
};

export type ServiceErrorCode =
  | "UNAVAILABLE"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "UNKNOWN";

export type ServiceFailure = {
  ok: false;
  error: {
    code: ServiceErrorCode;
    message: string;
  };
};

export type ServiceResult<T> = { ok: true; data: T } | ServiceFailure;

export type CreateEmailTicketInput = {
  nip: string;
};

export type CreateZoomTicketInput = {
  nip: string;
  description: string;
  /** Local Asia/Jakarta date and time, formatted as YYYY-MM-DDTHH:mm. */
  date: string;
  linkSurat: string | null;
};

export type UpdateEmailTicketInput = {
  id: number;
  status: TicketStatus;
  email?: string;
  emailPassword?: string;
};

export type UpdateZoomTicketInput = {
  id: number;
  zoomLink: string | null;
  status: TicketStatus;
  alasanDitolak: string | null;
};

/**
 * Query contract for the admin request tables. `search` matches the
 * employee name or NIP, `status` filters by the ticket status contract and
 * the result is paginated in the database (never fetched unbounded).
 */
export type TicketListQuery = {
  search: string;
  status: TicketStatus | null;
  page: number;
  pageSize: number;
};

export type TicketListPage<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

export interface TicketService {
  listEmailTickets(
    query: TicketListQuery,
  ): Promise<ServiceResult<TicketListPage<EmailTicketView>>>;
  getLatestEmailTicket(
    nip: string,
  ): Promise<ServiceResult<EmailTicketView | null>>;
  createEmailTicket(
    input: CreateEmailTicketInput,
  ): Promise<ServiceResult<{ id: number }>>;
  updateEmailTicketStatus(
    input: UpdateEmailTicketInput,
  ): Promise<ServiceResult<{ id: number }>>;
  listZoomTickets(
    query: TicketListQuery,
  ): Promise<ServiceResult<TicketListPage<ZoomTicketView>>>;
  listZoomTicketsForEmployee(
    nip: string,
  ): Promise<ServiceResult<ZoomTicketView[]>>;
  createZoomTicket(
    input: CreateZoomTicketInput,
  ): Promise<ServiceResult<{ id: number }>>;
  updateZoomTicket(
    input: UpdateZoomTicketInput,
  ): Promise<ServiceResult<{ id: number }>>;
}
