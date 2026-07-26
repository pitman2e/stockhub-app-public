import { Dispatch, SetStateAction } from "react";
import { ISortBy } from "../types/table";

export class TableHeaderSortDef {
  setSortBy: Dispatch<SetStateAction<{
    colName: string | null;
    isDesc: boolean;
  }>>;

  constructor(
    setSortBy: Dispatch<SetStateAction<ISortBy>>
  ) {
    this.setSortBy = setSortBy
  }

  get(colName: string, sortBy: ISortBy) {
    return {
      active: sortBy.colName === colName,
      direction: sortBy.isDesc ? 'desc' as const : 'asc' as const,
      onClick:
        () => {
          this.onTableSortLabelClick(colName, sortBy)
        }
    };
  };

  onTableSortLabelClick(
    colName: string,
    sortBy: ISortBy
  ) {
    if (sortBy.colName === null || sortBy.colName !== colName) {
      this.setSortBy({ colName, isDesc: false });
      return;
    }

    if (!sortBy.isDesc) {
      this.setSortBy({ colName, isDesc: true });
      return;
    }

    this.setSortBy({ colName: null, isDesc: false });
  };
}