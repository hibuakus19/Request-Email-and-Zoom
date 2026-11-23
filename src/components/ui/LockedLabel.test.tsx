import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LockedLabel from "./LockedLabel";

describe("LockedLabel", () => {
  it("shows the handled status and keeps the explanation in the DOM", () => {
    render(<LockedLabel />);

    expect(
      screen.getByRole("button", { name: "Sudah Ditangani" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Request yang sudah selesai ditangani/),
    ).toBeTruthy();
  });
});
