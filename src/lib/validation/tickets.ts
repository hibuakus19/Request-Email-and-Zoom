import {
  TICKET_PAGE_SIZE,
  TICKET_STATUSES,
  type TicketStatus,
} from "@/lib/tickets/constants";
import type { TicketListQuery } from "@/lib/tickets/types";

const SEARCH_MAX_LENGTH = 100;

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parsePage(value: string): number {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return Math.min(page, 10_000);
}

function parseStatus(value: string): TicketStatus | null {
  const status = value.trim().toUpperCase();

  return TICKET_STATUSES.includes(status as TicketStatus)
    ? (status as TicketStatus)
    : null;
}

/**
 * Parses the admin table query string (`q`, `status`, `page`) into the
 * `TicketListQuery` contract. Invalid values fall back to defaults instead of
 * failing the page; only contract statuses are accepted as filters.
 */
export function parseTicketListQuery(
  searchParams: RawSearchParams,
): TicketListQuery {
  const search = firstValue(searchParams.q).trim().slice(0, SEARCH_MAX_LENGTH);

  return {
    search,
    status: parseStatus(firstValue(searchParams.status)),
    page: parsePage(firstValue(searchParams.page)),
    pageSize: TICKET_PAGE_SIZE,
  };
}

/** Builds an href for the admin table preserving the current filter state. */
export function buildTicketListHref(
  basePath: string,
  query: TicketListQuery,
  page: number,
): string {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("q", query.search);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
