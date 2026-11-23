-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "karyawan" (
    "nip" VARCHAR(255) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "bagian" VARCHAR(100),
    "password" VARCHAR(255),
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "email_password" VARCHAR(255),

    CONSTRAINT "karyawan_pkey" PRIMARY KEY ("nip")
);

-- CreateTable
CREATE TABLE "email_ticket" (
    "id" SERIAL NOT NULL,
    "status" VARCHAR(25) NOT NULL DEFAULT 'PENDING',
    "request" VARCHAR(25) NOT NULL,
    "nip" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zoom_ticket" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nip" VARCHAR NOT NULL,
    "status" VARCHAR(25) NOT NULL DEFAULT 'PENDING',
    "zoom_link" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link_surat" VARCHAR(255),
    "alasan_ditolak" VARCHAR(255),

    CONSTRAINT "zoom_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_email_ticket_nip" ON "email_ticket"("nip");

-- CreateIndex
CREATE INDEX "idx_zoom_ticket_nip" ON "zoom_ticket"("nip");

-- AddForeignKey
ALTER TABLE "email_ticket" ADD CONSTRAINT "email_ticket_nip_fkey" FOREIGN KEY ("nip") REFERENCES "karyawan"("nip") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zoom_ticket" ADD CONSTRAINT "zoom_ticket_nip_fkey" FOREIGN KEY ("nip") REFERENCES "karyawan"("nip") ON DELETE NO ACTION ON UPDATE NO ACTION;
