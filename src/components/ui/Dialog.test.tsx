import { render, screen } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it } from "vitest";
import Dialog from "./Dialog";

describe("Dialog", () => {
  it("renders the eyebrow, title, close button, and children", () => {
    const dialogRef = { current: null } as RefObject<HTMLDialogElement | null>;

    render(
      <Dialog
        dialogRef={dialogRef}
        titleId="judul"
        eyebrow="Tiket #7"
        title="Kelola permintaan"
      >
        <p>Isi dialog</p>
      </Dialog>,
    );

    expect(screen.getByText("Tiket #7")).toBeTruthy();
    expect(screen.getByText("Kelola permintaan")).toBeTruthy();
    expect(screen.getByText("Isi dialog")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Tutup dialog", hidden: true }),
    ).toBeTruthy();
  });

  it("uses the custom close label when given", () => {
    const dialogRef = { current: null } as RefObject<HTMLDialogElement | null>;

    render(
      <Dialog
        dialogRef={dialogRef}
        titleId="judul"
        eyebrow="Panduan"
        title="Panduan"
        closeLabel="Tutup panduan"
      >
        <p>Isi</p>
      </Dialog>,
    );

    expect(
      screen.getByRole("button", { name: "Tutup panduan", hidden: true }),
    ).toBeTruthy();
  });
});
