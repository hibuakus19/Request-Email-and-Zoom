import { describe, expect, it } from "vitest";
import { formatTicketStatus, getAvatarTone, getInitials } from "./format";

describe("formatTicketStatus", () => {
  it("formats the supported ticket statuses", () => {
    expect(formatTicketStatus("PENDING")).toEqual({
      label: "Menunggu",
      tone: "warning",
    });
    expect(formatTicketStatus("REJECTED")).toEqual({
      label: "Ditolak",
      tone: "danger",
    });
    expect(formatTicketStatus("DONE")).toEqual({
      label: "Selesai",
      tone: "success",
    });
  });
});

describe("getInitials", () => {
  it("uses the first two letters of a single name", () => {
    expect(getInitials("budi")).toBe("BU");
  });

  it("uses the first and last word for multi-word names", () => {
    expect(getInitials("Budi Santoso")).toBe("BS");
    expect(getInitials("Siti  Aminah Rahayu")).toBe("SR");
  });

  it("falls back to ? for an empty name", () => {
    expect(getInitials("   ")).toBe("?");
  });
});

describe("getAvatarTone", () => {
  it("returns the same tone for the same NIP", () => {
    expect(getAvatarTone("12345")).toBe(getAvatarTone("12345"));
  });

  it("spreads different NIPs across more than one tone", () => {
    const tones = new Set(
      ["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008"].map(
        getAvatarTone,
      ),
    );

    expect(tones.size).toBeGreaterThan(1);
  });
});
