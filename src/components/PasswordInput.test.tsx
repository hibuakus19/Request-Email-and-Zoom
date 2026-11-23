import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PasswordInput from "./PasswordInput";

describe("PasswordInput", () => {
  it("removes spaces when noSpaces is set", async () => {
    const user = userEvent.setup();

    render(<PasswordInput placeholder="Password" noSpaces />);
    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;

    await user.type(input, "rahasia baru");

    expect(input.value).toBe("rahasiabaru");
  });

  it("keeps spaces when noSpaces is not set", async () => {
    const user = userEvent.setup();

    render(<PasswordInput placeholder="Password" />);
    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;

    await user.type(input, "a b");

    expect(input.value).toBe("a b");
  });
});
