import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TData extends import("@tanstack/table-core").RowData,
  > {
    isNumeric?: boolean;
    isGainLoss?: boolean;
    align?: "left" | "center" | "right";
    getCellSx?: (row: TData) => SxProps<Theme>;
  }
}
