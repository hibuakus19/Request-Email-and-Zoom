"use client";

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#f4f6f8",
          color: "#182a42",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            display: "flex",
            minHeight: "100dvh",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              border: "1px solid #dce3ea",
              borderRadius: "24px",
              background: "#ffffff",
              padding: "32px",
              boxShadow: "0 24px 55px -32px rgba(22,33,59,0.45)",
              textAlign: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: "56px",
                height: "56px",
                margin: "0 auto",
                borderRadius: "16px",
                background: "#fbecea",
                color: "#a12a20",
                fontSize: "26px",
                fontWeight: 700,
              }}
            >
              !
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#a12a20",
              }}
            >
              Kendala sistem
            </p>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "26px",
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
              }}
            >
              Aplikasi tidak dapat dimuat
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: "13.5px",
                lineHeight: 1.6,
                color: "#43536a",
              }}
            >
              Terjadi kesalahan pada tingkat aplikasi. Muat ulang halaman atau
              hubungi administrator jika masalah berlanjut.
            </p>
            {error.digest ? (
              <p
                style={{
                  margin: "12px 0 0",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "10.5px",
                  color: "#667085",
                }}
              >
                Kode kendala: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                marginTop: "24px",
                padding: "0 20px",
                border: 0,
                borderRadius: "12px",
                background: "#1f4e79",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Coba lagi
            </button>
            <Link
              href="/"
              style={{
                display: "block",
                marginTop: "12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#143a5c",
                textDecoration: "none",
              }}
            >
              Kembali ke halaman login
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
