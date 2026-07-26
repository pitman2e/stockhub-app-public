import "@tanstack/react-table";

export interface ISortBy {
    colName: string | null; 
    isDesc: boolean;
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    isNumeric?: boolean;
  }
}