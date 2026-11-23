import { describe, expect, it } from "vitest";
import { isFinalTicketStatus, TICKET_STATUSES } from "./constants";

describe("TICKET_STATUSES", () => {
  it("contains only the supported ticket statuses", () => {
    expect(TICKET_STATUSES).toEqual(["PENDING", "REJECTED", "DONE"]);
  });
});

describe("isFinalTicketStatus", () => {
  it("treats DONE and REJECTED as final", () => {
    expect(isFinalTicketStatus("DONE")).toBe(true);
    expect(isFinalTicketStatus("REJECTED")).toBe(true);
  });

  it("ignores case and surrounding spaces", () => {
    expect(isFinalTicketStatus(" done ")).toBe(true);
  });

  it("keeps PENDING editable", () => {
    expect(isFinalTicketStatus("PENDING")).toBe(false);
  });
});
