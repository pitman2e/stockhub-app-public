import { describe, expect, it } from "vitest";
import type { ColumnMeta, TableFeatures } from "@tanstack/react-table";

interface TestRow {
  foobar: number;
}

describe("TanStack table column metadata", () => {
  it("supports numeric and alignment metadata", () => {
    const meta: ColumnMeta<TableFeatures, TestRow, number> = {
      isNumeric: true,
      align: "right",
    };

    expect(meta.isNumeric).toBe(true);
    expect(meta.align).toBe("right");
  });
});
