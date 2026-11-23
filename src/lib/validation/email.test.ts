import { describe, expect, it } from "vitest";
import { validateEmailStatusUpdate } from "./email";

const base = { id: "1", status: "DONE", email: "", emailPassword: "" };

describe("validateEmailStatusUpdate", () => {
  it("rejects a password that contains whitespace", () => {
    const result = validateEmailStatusUpdate({
      ...base,
      emailPassword: "rahasia baru",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.emailPassword).toBe(
        "Password tidak boleh mengandung spasi.",
      );
    }
  });

  it("accepts a password without whitespace", () => {
    const result = validateEmailStatusUpdate({
      ...base,
      emailPassword: "rahasia_baru",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = validateEmailStatusUpdate({ ...base, status: "PROCESSING" });

    expect(result.ok).toBe(false);
  });
});
