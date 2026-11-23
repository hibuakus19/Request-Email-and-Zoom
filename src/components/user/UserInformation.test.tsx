import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import UserInformation from "./UserInformation";

describe("UserInformation", () => {
  it("keeps existing email credentials visible after a rejected request", async () => {
    const user = userEvent.setup();

    render(
      <UserInformation
        user={{
          nama: "Budi Santoso",
          nip: "12345",
          email: "budi@example.com",
          emailPassword: "rahasia_lama",
          bagian: "Teknologi Informasi",
        }}
        latestRequest={{
          ticket: {
            request: "RESET_PASSWORD",
            status: "REJECTED",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          unavailable: false,
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Tampilkan password" }),
    );

    expect(screen.getByText("rahasia_lama")).toBeTruthy();
  });
});
