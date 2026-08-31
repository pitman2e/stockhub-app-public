import { describe, expect, it } from "vitest";
import type { ColumnMeta } from "@tanstack/react-table";

describe("TanStack table column metadata", () => {
  it("supports numeric and alignment metadata", () => {
    const meta: ColumnMeta<any, any> = {
      isNumeric: true,
      align: "right",
    };

    expect(meta.isNumeric).toBe(true);
    expect(meta.align).toBe("right");
  });
});
