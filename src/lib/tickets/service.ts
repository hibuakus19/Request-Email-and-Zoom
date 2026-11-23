import "server-only";

import prisma from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  EMAIL_REQUEST,
  FINAL_TICKET_STATUSES,
  isFinalTicketStatus,
} from "./constants";
import type {
  CreateEmailTicketInput,
  CreateZoomTicketInput,
  EmailTicketView,
  ServiceResult,
  TicketListPage,
  TicketListQuery,
  TicketService,
  UpdateEmailTicketInput,
  UpdateZoomTicketInput,
  ZoomTicketView,
} from "./types";

const karyawanSummarySelect = {
  nama: true,
  email: true,
  bagian: true,
} as const;

type KaryawanSummaryRecord = {
  nama: string;
  email: string | null;
  bagian: string | null;
};

type EmailTicketRecord = {
  id: number;
  nip: string;
  request: string;
  status: string;
  createdAt: Date;
  karyawan: KaryawanSummaryRecord;
};

type ZoomTicketRecord = {
  id: number;
  nip: string;
  description: string;
  date: Date;
  zoomLink: string | null;
  linkSurat: string | null;
  alasanDitolak: string | null;
  status: string;
  createdAt: Date;
  karyawan: KaryawanSummaryRecord;
};

function mapEmailTicket(ticket: EmailTicketRecord): EmailTicketView {
  return {
    id: ticket.id,
    nip: ticket.nip,
    request: ticket.request,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    karyawan: ticket.karyawan,
  };
}

function mapZoomTicket(ticket: ZoomTicketRecord): ZoomTicketView {
  return {
    id: ticket.id,
    nip: ticket.nip,
    description: ticket.description,
    // `date` is a PostgreSQL TIMESTAMP WITHOUT TIME ZONE. The app stores local
    // Jakarta wall time using a UTC Date carrier, so slice the ISO string
    // instead of converting it to the server's timezone.
    date: ticket.date.toISOString().slice(0, 16),
    zoomLink: ticket.zoomLink,
    linkSurat: ticket.linkSurat,
    alasanDitolak: ticket.alasanDitolak,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    karyawan: ticket.karyawan,
  };
}

/**
 * Builds the shared filter for the admin request tables. `search` matches the
 * employee name or NIP through the `karyawan` relation; `status` filters by
 * the ticket status contract.
 */
function buildTicketListWhere(query: TicketListQuery) {
  const where: {
    status?: string;
    karyawan?: {
      OR: Array<
        | { nama: { contains: string; mode: "insensitive" } }
        | { nip: { contains: string; mode: "insensitive" } }
      >;
    };
  } = {};

  if (query.status) {
    where.status = query.status;
  }

  const search = query.search.trim();

  if (search) {
    where.karyawan = {
      OR: [
        { nama: { contains: search, mode: "insensitive" } },
        { nip: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  return where;
}

/**
 * Detects a Postgres serialization failure (Prisma code `P2034`). Two email
 * requests submitted at the same moment can only be separated by the
 * database itself; the loser of the race is reported as a conflict instead
 * of leaking an internal error.
 */
function isTransactionConflictError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

const FINAL_TICKET_LOCKED_MESSAGE =
  "Request yang sudah selesai ditangani tidak bisa dirubah";

/**
 * Ticket service implementation backed by the existing Prisma models.
 *
 * Security notes:
 * - Employee helpers receive the authenticated NIP from the caller.
 * - `createEmailTicket` derives the request type from the current employee
 *   email state inside the transaction, never from client input.
 * - `createEmailTicket` rejects a new submission while the employee still
 *   has a `PENDING` email ticket. The check and the insert run inside a
 *   serializable transaction so concurrent submissions cannot both pass.
 * - Admin list/update actions verify the admin session in the server action
 *   before calling this service.
 */
const ticketService: TicketService = {
  async listEmailTickets(
    query: TicketListQuery,
  ): Promise<ServiceResult<TicketListPage<EmailTicketView>>> {
    const where = buildTicketListWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [tickets, total] = await prisma.$transaction([
      prisma.emailTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { karyawan: { select: karyawanSummarySelect } },
        skip,
        take: query.pageSize,
      }),
      prisma.emailTicket.count({ where }),
    ]);

    return {
      ok: true,
      data: {
        rows: tickets.map(mapEmailTicket),
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    };
  },

  async getLatestEmailTicket(
    nip: string,
  ): Promise<ServiceResult<EmailTicketView | null>> {
    const ticket = await prisma.emailTicket.findFirst({
      where: { nip },
      orderBy: { createdAt: "desc" },
      include: { karyawan: { select: karyawanSummarySelect } },
    });

    return { ok: true, data: ticket ? mapEmailTicket(ticket) : null };
  },

  async createEmailTicket(
    input: CreateEmailTicketInput,
  ): Promise<ServiceResult<{ id: number }>> {
    const conflictError = {
      ok: false as const,
      error: {
        code: "CONFLICT" as const,
        message:
          "Masih ada pengajuan email Anda yang sedang diproses. Silakan tunggu hingga pengajuan tersebut selesai sebelum mengajukan kembali.",
      },
    };

    try {
      return await prisma.$transaction(
        async (tx): Promise<ServiceResult<{ id: number }>> => {
          const karyawan = await tx.karyawan.findUnique({
            where: { nip: input.nip },
            select: { email: true },
          });

          if (!karyawan) {
            return {
              ok: false,
              error: {
                code: "NOT_FOUND",
                message:
                  "Akun karyawan tidak ditemukan. Silakan login ulang atau hubungi administrator.",
              },
            };
          }

          const request =
            karyawan.email === null
              ? EMAIL_REQUEST.CREATE
              : EMAIL_REQUEST.RESET;

          // Business rule: one pending email ticket per employee. Checked
          // inside the serializable transaction right before the insert.
          const pendingCount = await tx.emailTicket.count({
            where: { nip: input.nip, status: "PENDING" },
          });

          if (pendingCount > 0) {
            return conflictError;
          }

          const ticket = await tx.emailTicket.create({
            data: {
              nip: input.nip,
              request,
              status: "PENDING",
            },
            select: { id: true },
          });

          return { ok: true, data: { id: ticket.id } };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isTransactionConflictError(error)) {
        return conflictError;
      }

      throw error;
    }
  },

  async updateEmailTicketStatus(
    input: UpdateEmailTicketInput,
  ): Promise<ServiceResult<{ id: number }>> {
    try {
      return await prisma.$transaction(
        async (tx): Promise<ServiceResult<{ id: number }>> => {
          const ticket = await tx.emailTicket.findUnique({
            where: { id: input.id },
            select: { id: true, nip: true, request: true, status: true },
          });

          if (!ticket) {
            return {
              ok: false,
              error: {
                code: "NOT_FOUND",
                message: "Tiket email tidak ditemukan.",
              },
            };
          }

          if (isFinalTicketStatus(ticket.status)) {
            return {
              ok: false,
              error: {
                code: "CONFLICT",
                message: FINAL_TICKET_LOCKED_MESSAGE,
              },
            };
          }

          const isCreateRequest =
            ticket.request.trim().toUpperCase() === EMAIL_REQUEST.CREATE;
          const isFirstCompletion =
            isCreateRequest &&
            input.status === "DONE" &&
            ticket.status !== "DONE";

          if (isFirstCompletion) {
            const karyawan = await tx.karyawan.findUnique({
              where: { nip: ticket.nip },
              select: { email: true, emailPassword: true },
            });

            if (!karyawan) {
              return {
                ok: false,
                error: {
                  code: "NOT_FOUND",
                  message: "Data karyawan untuk tiket ini tidak ditemukan.",
                },
              };
            }

            if (input.email && input.emailPassword) {
              await tx.karyawan.update({
                where: { nip: ticket.nip },
                data: {
                  email: input.email,
                  emailPassword: input.emailPassword,
                },
              });
            } else if (!karyawan.email || !karyawan.emailPassword) {
              return {
                ok: false,
                error: {
                  code: "VALIDATION",
                  message:
                    "Email dan password default wajib diisi sebelum request pembuatan email diselesaikan.",
                },
              };
            }
          }

          const isResetRequest =
            ticket.request.trim().toUpperCase() === EMAIL_REQUEST.RESET;
          const isFirstResetCompletion =
            isResetRequest &&
            input.status === "DONE" &&
            ticket.status !== "DONE";

          if (isFirstResetCompletion) {
            if (!input.emailPassword) {
              return {
                ok: false,
                error: {
                  code: "VALIDATION",
                  message:
                    "Password baru wajib diisi sebelum request reset password diselesaikan.",
                },
              };
            }

            await tx.karyawan.update({
              where: { nip: ticket.nip },
              data: { emailPassword: input.emailPassword },
            });
          }

          await tx.emailTicket.update({
            where: { id: input.id },
            data: { status: input.status },
          });

          return { ok: true, data: { id: ticket.id } };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isTransactionConflictError(error)) {
        return {
          ok: false,
          error: {
            code: "CONFLICT",
            message:
              "Tiket email sedang diubah oleh admin lain. Muat ulang halaman lalu coba lagi.",
          },
        };
      }

      throw error;
    }
  },

  async listZoomTickets(
    query: TicketListQuery,
  ): Promise<ServiceResult<TicketListPage<ZoomTicketView>>> {
    const where = buildTicketListWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [tickets, total] = await prisma.$transaction([
      prisma.zoomTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { karyawan: { select: karyawanSummarySelect } },
        skip,
        take: query.pageSize,
      }),
      prisma.zoomTicket.count({ where }),
    ]);

    return {
      ok: true,
      data: {
        rows: tickets.map(mapZoomTicket),
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    };
  },

  async listZoomTicketsForEmployee(
    nip: string,
  ): Promise<ServiceResult<ZoomTicketView[]>> {
    const tickets = await prisma.zoomTicket.findMany({
      where: { nip },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { karyawan: { select: karyawanSummarySelect } },
    });

    return { ok: true, data: tickets.map(mapZoomTicket) };
  },

  async createZoomTicket(
    input: CreateZoomTicketInput,
  ): Promise<ServiceResult<{ id: number }>> {
    const ticket = await prisma.zoomTicket.create({
      data: {
        nip: input.nip,
        description: input.description,
        // datetime-local is a Jakarta wall-clock value without a timezone.
        // Carry those same clock fields through Prisma as UTC so PostgreSQL's
        // TIMESTAMP WITHOUT TIME ZONE stores them without a timezone shift.
        date: new Date(`${input.date}:00.000Z`),
        status: "PENDING",
        zoomLink: null,
        linkSurat: input.linkSurat,
      },
      select: { id: true },
    });

    return { ok: true, data: { id: ticket.id } };
  },

  async updateZoomTicket(
    input: UpdateZoomTicketInput,
  ): Promise<ServiceResult<{ id: number }>> {
    const result = await prisma.zoomTicket.updateMany({
      where: {
        id: input.id,
        status: { notIn: [...FINAL_TICKET_STATUSES] },
      },
      data: {
        zoomLink: input.zoomLink,
        status: input.status,
        alasanDitolak: input.alasanDitolak,
      },
    });

    if (result.count === 0) {
      const exists = await prisma.zoomTicket.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!exists) {
        return {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Tiket Zoom tidak ditemukan.",
          },
        };
      }

      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: FINAL_TICKET_LOCKED_MESSAGE,
        },
      };
    }

    return { ok: true, data: { id: input.id } };
  },
};

export function getTicketService(): TicketService {
  return ticketService;
}

function loadFailure<T>(error: unknown, message: string): ServiceResult<T> {
  console.error(message, error);

  return {
    ok: false,
    error: {
      code: "UNKNOWN",
      message,
    },
  };
}

export async function loadEmailTickets(
  query: TicketListQuery,
): Promise<ServiceResult<TicketListPage<EmailTicketView>>> {
  try {
    return await getTicketService().listEmailTickets(query);
  } catch (error) {
    return loadFailure(
      error,
      "Data pengajuan email gagal dimuat. Silakan muat ulang halaman atau hubungi administrator.",
    );
  }
}

export async function loadLatestEmailTicket(
  nip: string,
): Promise<ServiceResult<EmailTicketView | null>> {
  try {
    return await getTicketService().getLatestEmailTicket(nip);
  } catch (error) {
    return loadFailure(
      error,
      "Status pengajuan email gagal dimuat. Silakan muat ulang halaman atau hubungi administrator.",
    );
  }
}

export async function loadZoomTickets(
  query: TicketListQuery,
): Promise<ServiceResult<TicketListPage<ZoomTicketView>>> {
  try {
    return await getTicketService().listZoomTickets(query);
  } catch (error) {
    return loadFailure(
      error,
      "Data pengajuan Zoom gagal dimuat. Silakan muat ulang halaman atau hubungi administrator.",
    );
  }
}

export async function loadZoomTicketsForEmployee(
  nip: string,
): Promise<ServiceResult<ZoomTicketView[]>> {
  try {
    return await getTicketService().listZoomTicketsForEmployee(nip);
  } catch (error) {
    return loadFailure(
      error,
      "Riwayat tiket Zoom gagal dimuat. Silakan muat ulang halaman atau hubungi administrator.",
    );
  }
}
