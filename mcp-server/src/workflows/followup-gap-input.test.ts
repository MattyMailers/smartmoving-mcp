import { describe, expect, it } from "vitest";
import { jobNumbersFromCsv } from "./followup-gap-input.js";

describe("jobNumbersFromCsv", () => {
  it("extracts the Job Number column from a quoted SmartMoving-style CSV", () => {
    const csv = '\uFEFF"Customer","Job Number","Move Date"\r\n"Doe, Jane","90001-1","2026-07-01"\r\n"Smith, John","90002-2","2026-08-01"\r\n';
    expect(jobNumbersFromCsv(csv)).toEqual(["90001-1", "90002-2"]);
  });

  it("supports escaped quotes, embedded newlines, an explicit column, and blank rows", () => {
    const csv = 'Opportunity,Quote #,Notes\n"First ""VIP""",12345,"line one\nline two"\nSecond,,blank quote\nThird,Q-23456,ok\n';
    expect(jobNumbersFromCsv(csv, "Quote #")).toEqual(["12345", "Q-23456"]);
  });

  it("fails with available headers instead of choosing the wrong or duplicate column", () => {
    expect(() => jobNumbersFromCsv("Customer,Move Date\nExample,2026-01-01\n")).toThrow("Available columns: Customer, Move Date");
    expect(() => jobNumbersFromCsv("Job Number,Job Number\n12345-1,23456-1\n")).toThrow("appears more than once");
  });

  it("rejects malformed and header-only CSV files", () => {
    expect(() => jobNumbersFromCsv('Job Number\n"12345-1')).toThrow("unterminated quoted field");
    expect(() => jobNumbersFromCsv("Job Number\n")).toThrow("contains no job or quote numbers");
  });
});
