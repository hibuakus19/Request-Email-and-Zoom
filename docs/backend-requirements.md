# Backend Requirements

Short, actionable list of what the backend must provide so the completed
frontend can work with real data. Full contract:
[`frontend-backend-contract.md`](./frontend-backend-contract.md).

## Blocking (must be configured before go-live)

1. **Verified admin role source — resolved.** `karyawan.is_admin` is the
   server-owned admin flag (`true` = admin, `false`/`NULL` = employee). Login
   reads it and passes it to `createSession(user, isAdmin)`. Do not accept a
   role from the client. Keep `is_admin` values accurate and revoke access by
   setting it to `false`.
2. **`SESSION_SECRET` in production.** The signed session cookie requires
   `SESSION_SECRET` (or `AUTH_SECRET`). Production startup fails without it.
3. **Password hash migration.** Existing plaintext `karyawan.password` values
   are accepted only for development compatibility. Migrate them to
   `scrypt$N$r$p$salt$hash` using `src/lib/auth/password.ts` before go-live.

## Ticket service implementation

4. **`TicketService` — implemented with Prisma.** Email and Zoom create/list
   methods, employee Zoom history, and email latest-status reads are wired in
   `src/lib/tickets/service.ts`.
5. **Email ticket creation — implemented.** The service re-reads
   `karyawan.email`, derives `CREATE_EMAIL` vs `RESET_PASSWORD` server-side, and
   inserts with `status = 'PENDING'`.
6. **Zoom ticket creation — implemented.** Inserts `description`,
   `date` (local Asia/Jakarta `YYYY-MM-DDTHH:mm`), optional `link_surat`,
   `status = 'PENDING'`, and `zoom_link = NULL`. Many tickets per employee are
   allowed.
7. **Admin ticket lists — implemented.** Admin pages verify `isAdmin` and load
   all email/Zoom tickets joined with `karyawan.nama`, `karyawan.email`, and
   `karyawan.bagian`.
8. **Zoom ticket update — implemented.** Verify `ADMIN` server-side and update
   only `zoom_link` and `status`.

## Data decisions to confirm

9. Confirm the `email_ticket.request` vocabulary (`CREATE_EMAIL`,
   `RESET_PASSWORD`) with the data owner.
10. The ticket status vocabulary is `PENDING`, `REJECTED`, and `DONE`.
    Columns remain free-text `VARCHAR(25)`, so the backend should persist only
    these application-level values.
11. Define list ordering; the frontend expects newest-first by convention.

## Operational / later

12. Approval/provisioning workflow and notification delivery (email creation,
    password reset, Zoom link issuance).
13. Pagination, search, and filtering if ticket volume grows.
14. Audit logging for admin Zoom updates, if required by policy.
15. Database/connection configuration for deployment (the frontend repository
    must not read or modify `.env`).
