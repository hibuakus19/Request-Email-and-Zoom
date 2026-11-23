# Frontend ↔ Backend Contract

Status: **frontend complete; email and Zoom tickets are connected to Prisma.**

This document is the contract between the Next.js frontend and the ticketing
backend. Requests are persisted in `email_ticket` and `zoom_ticket` through
Prisma. Employees can see the status of their latest email request and the full
history of their Zoom requests, and admins can read the full ticket lists. No
mock tickets are presented as real data.

The authoritative database structure is `docs/database-schema.md`. Prisma maps
that existing schema; the application does not apply database changes
automatically.

---

## 1. Routes and access

| Route | Access | Rendering |
|---|---|---|
| `/` | Public | Login page |
| `/home` | Any authenticated employee or admin | Server Component |
| `/home/email` | Authenticated; employee form or admin table | Server Component |
| `/home/zoom` | Authenticated; employee form or admin table | Server Component |

All protected routes are guarded in
`src/app/(protected)/layout.tsx`. A missing or invalid session redirects to
`/?reason=session-expired`. The role decision is made on the server in
`src/app/(protected)/home/email/page.tsx` and
`src/app/(protected)/home/zoom/page.tsx`; client-side conditionals are never
used as a security boundary.

---

## 2. Session contract

Implemented in `src/lib/auth/session.ts`.

- Cookie name: `ticketing_session`
- Value: `base64url(JSON payload).base64url(HMAC-SHA256 signature)`
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, 8-hour TTL,
  `Secure` when `NODE_ENV=production`
- Required production environment variable: `SESSION_SECRET`
  (`AUTH_SECRET` is accepted as a fallback). A development-only fallback exists
  when `NODE_ENV !== "production"`; production startup throws if neither
  variable is set.
- Session payload:

```ts
type Session = {
  nip: string;
  nama: string;
  email: string | null;
  bagian: string | null;
  isAdmin: boolean;
  issuedAt: number;
  expiresAt: number;
};
```

`isAdmin` comes from `karyawan.is_admin` and is read on the server during login.
A `NULL` database value is normalised to `false`, so a missing flag never grants
admin access. Every admin page and server action still calls `isAdmin(session)`
before doing work.

Verification rejects tampered signatures, wrong payload versions, malformed
fields, and expired sessions. The HMAC comparison is constant-time. Session
payload version `2` is required; cookies created before the `is_admin` change
(version `1`) are rejected and the user must log in again.

---

## 3. Login flow

Implemented in `src/lib/auth/actions.ts`.

1. Validate `nip` and `password` (`src/lib/validation/login.ts`).
2. Look up `karyawan` by `nip` using Prisma, selecting only `nip`, `nama`,
   `email`, `bagian`, `password`, and `isAdmin`.
3. Verify the password with `src/lib/auth/password.ts`.
4. Create the signed session with `createSession(user, isAdmin)`. The flag is
   `karyawan.isAdmin === true`, so `NULL` becomes `false`.
5. Redirect to `/home`.

Credential failures return one generic message, so the UI does not reveal
whether the NIP exists. Database failures return a separate service message.
Plaintext passwords are never written to the session or logs.

### Password storage

Accepted verifier formats:

- `scrypt$N$r$p$salt(base64url)$hash(base64url)` — preferred.
- Legacy plaintext — accepted only for backwards compatibility with existing
  data. It must be migrated before production go-live.
- bcrypt (`$2...`) — currently rejected; bcrypt is not in the dependency set.

`hashPassword()` already produces the scrypt format using the existing
`karyawan.password` column, so migration needs no schema change. Recommended
backend step: on a successful legacy login, re-hash and update the row; or run
a one-off migration with the same helper.

---

## 4. Role and admin access

Admin identity comes from `karyawan.is_admin` (`BOOLEAN`, nullable). Login reads
the column on the server and stores `isAdmin` in the signed session.

- `true` → admin pages, admin tables, and admin server actions are available.
- `false` or `NULL` → regular employee; least privilege applies.
- The flag is never accepted from form data, headers, or client state.
- `src/lib/auth/session.ts` exposes `isAdmin(session)`; every admin page and
  server action re-checks it.
- Changing `is_admin` in the database does not invalidate an existing cookie.
  The new value applies on the next login, or immediately if the session is
  cleared/re-issued. Keep the 8-hour TTL in mind when revoking admin access.

Optional hardening for a future iteration: re-read `is_admin` from the database
inside `getSession`, or shorten the session TTL for admins.

---

## 5. Data contract

The frontend view models in `src/lib/tickets/types.ts` mirror the documented
tables. The backend adapter is responsible for joining `karyawan` and
serialising dates.

### `EmailTicketView`

| Field | Source | Notes |
|---|---|---|
| `id` | `email_ticket.id` | number |
| `nip` | `email_ticket.nip` | string |
| `request` | `email_ticket.request` | `VARCHAR(25)` |
| `status` | `email_ticket.status` | `VARCHAR(25)`, default `PENDING` |
| `createdAt` | `email_ticket.created_at` | ISO 8601 string |
| `karyawan.nama` | `karyawan.nama` | string |
| `karyawan.email` | `karyawan.email` | `string | null` |
| `karyawan.bagian` | `karyawan.bagian` | `string | null` |

### `ZoomTicketView`

| Field | Source | Notes |
|---|---|---|
| `id` | `zoom_ticket.id` | number |
| `nip` | `zoom_ticket.nip` | string |
| `description` | `zoom_ticket.description` | `VARCHAR(255)` |
| `date` | `zoom_ticket.date` | Local Jakarta date/time, `YYYY-MM-DDTHH:mm`, no timezone offset |
| `zoomLink` | `zoom_ticket.zoom_link` | `string | null` |
| `linkSurat` | `zoom_ticket.link_surat` | Optional `http(s)` URL, max 255 characters; `string | null` |
| `alasanDitolak` | `zoom_ticket.alasan_ditolak` | Reason entered by admin when status is `REJECTED`; `string | null` |
| `status` | `zoom_ticket.status` | `VARCHAR(25)`, default `PENDING` |
| `createdAt` | `zoom_ticket.created_at` | ISO 8601 string |
| `karyawan.nama` | `karyawan.nama` | string |
| `karyawan.email` | `karyawan.email` | `string | null` |
| `karyawan.bagian` | `karyawan.bagian` | `string | null` |

Lists should be ordered newest-first (`created_at DESC`, then `id DESC`) unless
product requirements say otherwise.

### Request and status values

`request` and `status` are free-text `VARCHAR` columns, not database enums. The
frontend proposes these application-level values in
`src/lib/tickets/constants.ts`; confirm them with the backend before writing
production data.

Email request (`email_ticket.request`):

- `CREATE_EMAIL`
- `RESET_PASSWORD`

Ticket status contract (`email_ticket.status`, `zoom_ticket.status`):

- `PENDING` (database default)
- `REJECTED`
- `DONE`

The UI also renders unknown values gracefully by title-casing them, so a
different backend vocabulary will not break the table.

---

## 6. `TicketService` interface

Defined in `src/lib/tickets/types.ts` and implemented with Prisma in
`src/lib/tickets/service.ts`.

```ts
interface TicketService {
  listEmailTickets(): Promise<ServiceResult<EmailTicketView[]>>;
  getLatestEmailTicket(
    nip: string,
  ): Promise<ServiceResult<EmailTicketView | null>>;
  createEmailTicket(
    input: CreateEmailTicketInput,
  ): Promise<ServiceResult<{ id: number }>>;
  listZoomTickets(): Promise<ServiceResult<ZoomTicketView[]>>;
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
```

Inputs:

```ts
type CreateEmailTicketInput = { nip: string };
type CreateZoomTicketInput = {
  nip: string;
  description: string;
  date: string; // local Asia/Jakarta date/time, YYYY-MM-DDTHH:mm
  linkSurat: string | null; // optional http(s) URL, max 255 characters
};
type UpdateZoomTicketInput = {
  id: number;
  zoomLink: string | null; // always null when status is REJECTED
  status: string;
  alasanDitolak: string | null; // required when status is REJECTED
};
```

Results:

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code:
          | "UNAVAILABLE"
          | "FORBIDDEN"
          | "NOT_FOUND"
          | "CONFLICT"
          | "VALIDATION"
          | "UNKNOWN";
        message: string; // safe to show to the user
      };
    };
```

Backend implementation status:

- `listEmailTickets` and `listZoomTickets` are admin-only and already
  implemented with Prisma. The admin pages verify `isAdmin` before calling them.
- `getLatestEmailTicket` is an employee-scoped read for the latest request
  status on `/home/email`.
- `listZoomTicketsForEmployee` returns all Zoom requests for the authenticated
  NIP, newest first, including each request's status, Zoom link, and rejection reason.
- `createEmailTicket` is employee-only. It re-reads `karyawan.email` from the
  database and derives the request type there. The client never supplies
  `request`. It inserts `status = 'PENDING'`.
- `createZoomTicket` is employee-only. It inserts `status = 'PENDING'`,
  `zoom_link = NULL`, and the optional `link_surat` provided with the request.
  One employee may create many tickets.
- `updateZoomTicket` is admin-only and updates `zoom_link`, `status`, and
  `alasan_ditolak`. Saving a `REJECTED` status clears `zoom_link`.
- Employee reads are scoped to the authenticated NIP.
- Database/transport failures are mapped to user-safe Indonesian messages and
  logged server-side.

The rest of the UI depends only on this interface, so an alternative adapter can
replace the Prisma implementation without page/component changes.

---

## 7. Server action contracts

Shared result shape (`src/lib/actions/types.ts`):

```ts
type FormActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  reference?: string;
};
```

### `requestEmailTicketAction(previousState, formData)`

`src/lib/actions/email.ts`.

- Requires a session.
- Rejects admins (admin uses the table page).
- Derives the request type from server-side session email state:
  `email === null` → `CREATE_EMAIL`, otherwise `RESET_PASSWORD`.
- Reads no user-supplied form fields.
- Calls `createEmailTicket`, revalidates `/home/email`, and returns a success
  message plus the ticket id as `reference`.

### `createZoomTicketAction(previousState, formData)`

`src/lib/actions/zoom.ts`.

- Requires a session and rejects admins.
- Reads `description`, `date`, and optional `linkSurat`.
- Validates: description required, max 255 characters; date required, valid
  `YYYY-MM-DDTHH:mm`, not before the current minute in `Asia/Jakarta`; an
  optional link must be a valid `http://` or `https://` URL no longer than 255
  characters.
- Calls `createZoomTicket`, revalidates `/home/zoom`, and returns a success
  message plus the ticket id.

### `updateZoomTicketAction(previousState, formData)`

`src/lib/actions/zoom.ts`.

- Requires a session and rejects non-admins server-side.
- Reads `id`, `zoomLink`, `status`, `alasanDitolak`.
- Validates: positive integer id; status required, normalised to uppercase;
  when status is `REJECTED`, `alasanDitolak` is required (max 255 characters)
  and `zoomLink` is ignored; otherwise an optional link must be `http://` or
  `https://`.
- Calls `updateZoomTicket`, revalidates `/home/zoom`.

Validation errors are returned as `fieldErrors` and rendered inline; error
boundaries are not used for form validation.

---

## 8. Date and time handling

- `APP_TIME_ZONE = "Asia/Jakarta"`.
- `created_at` is `TIMESTAMPTZ`; serialise to ISO 8601 and format in
  `Asia/Jakarta` for display.
- `zoom_ticket.date` is PostgreSQL `TIMESTAMP(3) WITHOUT TIME ZONE` and represents
  a local Asia/Jakarta event time. Keep `YYYY-MM-DDTHH:mm` (without an offset)
  through the service boundary and display it without timezone conversion.
- When sending the local wall-clock value through Prisma's JavaScript `Date`
  type, use its UTC fields as a carrier so the stored timestamp keeps the
  selected Jakarta date and time; do not format it as a real UTC instant.
- Past-time validation and the input's minimum use `Asia/Jakarta`.

---

## 9. Error and loading behaviour

- Protected route loading skeleton: `src/app/(protected)/loading.tsx`.
- Protected route error boundary: `src/app/(protected)/error.tsx`.
- Root fatal error boundary: `src/app/global-error.tsx`.
- Not-found page: `src/app/not-found.tsx`.
- Forms use `useActionState`, disable submit while pending, prevent duplicate
  submission, and announce success/failure with an `aria-live` region.
- Admin tables distinguish:
  - `ok: true` + zero rows → genuine empty state.
  - `ok: false` → "data unavailable" state with the service message and a
    refresh action.
- Service failures never fall back to fabricated rows.

---

## 10. Backend integration checklist

1. Set `SESSION_SECRET` in the production environment; never commit it.
2. Keep `karyawan.is_admin` accurate; login already passes it to
   `createSession`.
3. Migrate legacy plaintext passwords to the scrypt format; then remove plaintext
   acceptance if possible.
4. Implement `TicketService` with Prisma or an internal HTTP API.
5. Re-derive email request type from `karyawan.email` inside the create
   transaction.
6. Enforce admin authorization for list/update operations on the server.
7. Confirm `CREATE_EMAIL`, `RESET_PASSWORD`, and the status vocabulary with the
   backend/data owner.
8. Add pagination/filtering if ticket volume requires it; the current table
   renders the full array.
9. Add audit logging for admin updates if required by policy.
10. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` after wiring the
    adapter.

---

## 11. Known limitations

- Ticket persistence, employee status summaries, and admin lists are wired to
  Prisma.
- Email status can only be changed directly in the database for now; the admin
  email page has no status editor yet.
- Admin pages are reachable only for accounts with `karyawan.is_admin = true`.
- Password hashing migration is not automated by the frontend.
- There is no pagination, search, or filtering in the admin tables yet.
- No email/Zoom provisioning, approval workflow, or notification delivery is
  implemented; those are backend responsibilities.
- Session state (including `email`) is captured at login. Email request type
  must therefore be re-derived by the backend at creation time.
