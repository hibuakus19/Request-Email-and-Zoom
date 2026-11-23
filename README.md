# Ticketing — Request Email & Zoom

Aplikasi internal untuk pengajuan email kantor dan ruang Zoom. Project ini
dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Prisma 7, dan
PostgreSQL.

Panduan ini mencakup setup developer, penggunaan aplikasi, serta prosedur
setelah mengambil perubahan terbaru dari repository.

## Prasyarat

- Node.js 20.9 atau lebih baru.
- npm.
- PostgreSQL yang sedang berjalan.
- Akun karyawan yang tersedia di database.
- Akses ke repository Git.

Periksa versi yang terpasang:

```bash
node --version
npm --version
```

## Setup pertama kali

### 1. Clone repository

```bash
git clone <URL_REPOSITORY>
cd req-email-dinas
```

Jika repository sudah pernah di-clone:

```bash
git pull
```

### 2. Pasang dependency

Gunakan `npm ci` untuk instalasi yang mengikuti `package-lock.json`:

```bash
npm ci
```

### 3. Siapkan environment

Salin file contoh environment. File `.env` tidak boleh di-commit karena
berisi credential lokal:

```bash
cp .env.example .env
```

Di PowerShell Windows:

```powershell
Copy-Item .env.example .env
```

Isi `.env`:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/ticket_aps?schema=public"
SESSION_SECRET="gunakan-rahasia-acak-yang-kuat"
```

`SESSION_SECRET` wajib diatur dengan nilai kuat pada production. Aplikasi
memiliki fallback development, tetapi fallback tersebut tidak boleh digunakan
untuk deployment production.

### 4. Siapkan database

Buat database kosong untuk local development:

```bash
createdb -U postgres ticket_aps
```

Terapkan migration yang tersedia:

```bash
npm exec -- prisma migrate deploy
```

Generate Prisma Client:

```bash
npm exec -- prisma generate
```

Jangan menjalankan migration awal secara manual pada database yang sudah
berisi data. Untuk database existing, pastikan migration history dan struktur
database sudah disepakati dengan administrator/backend. Referensi struktur
tersedia di [`docs/database-schema.md`](docs/database-schema.md).

> **Penting tentang migration baseline:** migration lama pada repository ini
> telah diringkas menjadi satu migration awal `0_init`. Baseline ini ditujukan
> untuk database baru. Jika database sudah pernah menggunakan migration lama,
> jangan langsung menjalankan `prisma migrate deploy`; minta administrator atau
> senior melakukan verifikasi schema dan proses baseline terlebih dahulu.

### 5. Siapkan akun login

Project ini belum memiliki seed account otomatis. Untuk database local baru,
akun demo dapat dibuat melalui `psql` atau pgAdmin:

```sql
INSERT INTO karyawan (nip, nama, password, is_admin)
VALUES ('demo', 'Pengguna Demo', 'demo-password', false);
```

Login menggunakan:

```text
NIP      : demo
Password : demo-password
```

Password plaintext hanya untuk local development dan kompatibilitas data lama.
Sebelum production, gunakan password hash scrypt. Lihat
[`docs/backend-requirements.md`](docs/backend-requirements.md).

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), kemudian login dengan akun
yang tersedia di tabel `karyawan`.

Jika PowerShell memblokir `npm.ps1`, gunakan executable `.cmd`:

```powershell
npm.cmd ci
npm.cmd exec -- prisma migrate deploy
npm.cmd exec -- prisma generate
npm.cmd run dev
```

## Setelah `git pull`

Dari directory project:

```bash
git pull
npm exec -- prisma generate
npm exec -- prisma migrate deploy
npm run dev
```

Jika `package.json` atau `package-lock.json` berubah, pasang ulang dependency:

```bash
npm ci
```

Jika migration database berubah, jalankan `prisma migrate deploy` sebelum
menjalankan aplikasi hanya jika database menggunakan migration history repository
ini. Jangan menerapkan migration ke database production tanpa prosedur backup
dan persetujuan administrator.

## Cara menggunakan aplikasi

### Karyawan

1. Login menggunakan NIP dan password aplikasi.
2. Buka **Request Email**:
   - Jika belum memiliki email kantor, tombol akan membuat request email baru.
   - Jika sudah memiliki email kantor, tombol akan membuat request reset password.
   - Satu karyawan tidak dapat membuat request email baru ketika masih ada
     request berstatus `PENDING`.
3. Buka **Request Zoom**:
   - Isi deskripsi meeting.
   - Pilih tanggal dan waktu acara dalam waktu Jakarta/WIB.
   - Tambahkan link surat perintah jika tersedia.
   - Riwayat request dan detail status dapat dilihat pada halaman yang sama.
4. Buka **Informasi Akun** untuk melihat profil dan role akun.

### Admin

Role admin ditentukan dari `karyawan.is_admin` dan diverifikasi di server.
Pengecekan pada client bukan batas keamanan.

Admin dapat:

- Melihat daftar semua request Email dan Zoom.
- Mencari berdasarkan nama atau NIP.
- Memfilter berdasarkan status.
- Membuka editor tiket yang masih dapat diubah.
- Mengubah status tiket Email.
- Mengisi credential email ketika request pembuatan email diselesaikan.
- Mengisi link Zoom atau alasan penolakan.

Status tiket yang digunakan aplikasi:

| Status | Arti |
|---|---|
| `PENDING` | Request sedang menunggu atau diproses |
| `REJECTED` | Request ditolak dan memerlukan alasan |
| `DONE` | Request selesai |

Tiket `REJECTED` dan `DONE` bersifat final dan tidak dapat diedit kembali.
Credential baru hanya disimpan ketika request berhasil diselesaikan dengan
status `DONE`. Credential lama tidak diubah ketika request ditolak. Credential
email berbeda dari password login aplikasi dan, jika tersedia, dapat ditampilkan
dari profil menggunakan tombol tampil/sembunyikan.

## Halaman aplikasi

| Route | Akses | Keterangan |
|---|---|---|
| `/` | Publik | Login NIP dan password |
| `/home` | Karyawan dan admin | Dashboard Email dan Zoom |
| `/home/account` | Karyawan dan admin | Informasi akun |
| `/home/email` | Karyawan | Request email baru atau reset password |
| `/home/email` | Admin | Daftar dan pengelolaan request Email |
| `/home/zoom` | Karyawan | Form request dan riwayat Zoom |
| `/home/zoom` | Admin | Daftar dan pengelolaan request Zoom |

## Perintah project

```bash
npm run dev            # development server
npm run lint           # ESLint
npm run typecheck      # TypeScript tanpa emit
npm test               # Vitest
npm run format:check   # pemeriksaan Prettier
npm run build          # production build
npm run start          # menjalankan hasil production build
```

Sebelum membuat pull request, jalankan minimal:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Production

Pastikan environment production memiliki:

```dotenv
DATABASE_URL="postgresql://..."
SESSION_SECRET="rahasia-acak-yang-kuat"
```

Prosedur umum deployment:

```bash
npm ci
npm exec -- prisma migrate deploy
npm exec -- prisma generate
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Jangan gunakan akun demo atau password plaintext di production. Pastikan
database sudah di-backup sebelum menjalankan migration.

## Struktur project

```text
src/app/(auth)/              Halaman login
src/app/(protected)/         Home, Account, Email, Zoom, error/loading
src/components/              Form, table, dialog, dan UI primitives
src/lib/auth/                Session, login, logout, password verification
src/lib/actions/             Server Actions Email dan Zoom
src/lib/tickets/             Service, type, status, dan formatter tiket
src/lib/validation/          Validasi login, tiket, dan waktu
prisma/                      Schema dan database migrations
docs/                        Kontrak backend dan dokumentasi database
public/                      Asset publik
```

## Troubleshooting

### Prisma Client belum ditemukan

Jalankan:

```bash
npm exec -- prisma generate
```

### Database tidak dapat diakses

Periksa hal berikut:

- PostgreSQL sedang berjalan.
- `DATABASE_URL` benar.
- Database `ticket_aps` sudah dibuat.
- User PostgreSQL memiliki akses ke database.

### Migration gagal

Jangan menjalankan migration awal secara manual pada database berisi data.
Periksa status dan struktur database bersama administrator/backend sebelum
melanjutkan.

### Login gagal

Pastikan akun tersedia di tabel `karyawan`, password sesuai, dan nilai
`is_admin` hanya digunakan untuk menentukan role admin.

## Dokumentasi backend

- [`docs/frontend-backend-contract.md`](docs/frontend-backend-contract.md)
  — kontrak frontend dan backend.
- [`docs/database-schema.md`](docs/database-schema.md)
  — struktur tabel dan aturan data.
- [`docs/backend-requirements.md`](docs/backend-requirements.md)
  — kebutuhan production dan integrasi backend.
