import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RequestTable, { type RequestTableColumn } from "./RequestTable";

type Row = { id: number; nama: string };

const columns: RequestTableColumn<Row>[] = [
  { key: "nama", header: "Nama", mobile: "title", cell: (row) => row.nama },
];

describe("RequestTable", () => {
  it("shows the empty state when there are no rows", () => {
    render(
      <RequestTable<Row>
        rows={[]}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Daftar"
        emptyState={<p>Belum ada data</p>}
      />,
    );

    expect(screen.getByText("Belum ada data")).toBeTruthy();
  });

  it("renders each row in the desktop table and the mobile list", () => {
    render(
      <RequestTable<Row>
        rows={[{ id: 1, nama: "Budi Santoso" }]}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Daftar"
        emptyState={<p>Kosong</p>}
      />,
    );

    expect(screen.getAllByText("Budi Santoso")).toHaveLength(2);
  });
});
