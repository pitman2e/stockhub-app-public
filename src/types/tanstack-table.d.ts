import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TFeatures extends import("@tanstack/table-core").TableFeatures,
    TData extends import("@tanstack/table-core").RowData,
    TValue extends import("@tanstack/table-core").CellData = import("@tanstack/table-core").CellData,
  > {
    isNumeric?: boolean;
    isGainLoss?: boolean;
    align?: "left" | "center" | "right";
    getCellSx?: (row: TData) => SxProps<Theme>;
  }
}
