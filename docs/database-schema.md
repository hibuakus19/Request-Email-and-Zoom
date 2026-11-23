# Database Schema — Ticketing Application

Database: PostgreSQL  
Database name: ticket_aps  
ORM: Prisma

Dokumentasi ini merupakan representasi struktur database yang sudah tersedia. Agent tidak memiliki izin untuk mengakses database secara langsung.

## 1. Table: karyawan

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| nip | VARCHAR(255) | No | Primary Key |
| nama | VARCHAR(100) | No | |
| email | VARCHAR(100) | Yes | |
| bagian | VARCHAR(100) | Yes | |
| password | VARCHAR(255) | Yes | |
| is_admin | BOOLEAN | Yes | |
| email_password | VARCHAR(255) | Yes | Password default email karyawan |

Keterangan:
- nip merupakan identitas unik karyawan.
- email NULL berarti karyawan belum memiliki email.
- bagian merupakan divisi atau unit kerja karyawan.
- password nullable karena belum semua akun memiliki password yang disiapkan.
- is_admin menentukan akses admin. Nilai `true` berarti admin; `false` atau
  `NULL` diperlakukan sebagai karyawan biasa (least privilege).

## 2. Table: email_ticket

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | INTEGER | No | Primary Key, auto increment |
| nip | VARCHAR | No | Foreign Key |
| request | VARCHAR(25) | No | |
| status | VARCHAR(25) | No | Default PENDING |
| created_at | TIMESTAMPTZ | No | Default CURRENT_TIMESTAMP |

Relasi:
- email_ticket.nip references karyawan.nip.

Business rules:
- Jika karyawan.email IS NULL, karyawan dapat mengajukan pembuatan email.
- Jika karyawan.email IS NOT NULL, karyawan hanya dapat mengajukan reset password.
- Pengajuan email dilakukan melalui satu tombol, tanpa formulir tambahan.
- Jenis request harus ditentukan berdasarkan kondisi email karyawan.

## 3. Table: zoom_ticket

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | INTEGER | No | Primary Key, auto increment |
| nip | VARCHAR | No | Foreign Key |
| description | VARCHAR(255) | No | |
| date | TIMESTAMP(3) WITHOUT TIME ZONE | No | Waktu acara lokal (Asia/Jakarta) |
| zoom_link | TEXT | Yes | |
| link_surat | VARCHAR(255) | Yes | Tautan surat perintah |
| alasan_ditolak | VARCHAR(255) | Yes | Alasan penolakan, diisi admin saat status REJECTED |
| status | VARCHAR(25) | No | Default PENDING |
| created_at | TIMESTAMPTZ | No | Default CURRENT_TIMESTAMP |

Relasi:
- zoom_ticket.nip references karyawan.nip.

Business rules:
- Satu karyawan dapat membuat banyak tiket Zoom.
- Setiap tiket mempunyai deskripsi dan waktu acara sendiri.
- Admin dapat mengisi zoom_link pada tiket.
- Jika status tiket diubah menjadi REJECTED, admin wajib mengisi alasan_ditolak
  dan zoom_link dikosongkan (NULL).
- Pemohon dapat menyertakan link surat perintah; kolom ini opsional.

## 4. Database relationships

- karyawan 1:N email_ticket.
- karyawan 1:N zoom_ticket.

## 5. Important limitations

- Sumber role admin adalah kolom `karyawan.is_admin` (`true` = admin,
  `false`/`NULL` = karyawan).
- Jangan mengubah schema database atau membuat migration dari sisi frontend.
- Jangan mengasumsikan nilai ENUM karena kolom request dan status saat ini menggunakan VARCHAR.
- Nilai default status adalah PENDING.

Gunakan dokumentasi ini sebagai kontrak data untuk perancangan UI. Jika ada kebutuhan data yang belum tersedia, laporkan terlebih dahulu dan jangan mengubah database secara otomatis.
