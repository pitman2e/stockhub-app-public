import { useEffect, useMemo, useRef, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import utils from "../../utils/utils";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import {
  DefaultErrorPlaceholder,
  DefaultPaper,
  DefaultLinearProgress,
} from "../../components/DefaultComponents";
import { useQuery } from "@tanstack/react-query";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import StockTickerLink from "../../components/StockTickerLink";
import TableSkeletonCells from "../../components/TableSkeletonCells";
import repoPortfolio from "../../repo/repoPortfolio";
import { Box, Grid, TableSortLabel } from "@mui/material";
import { ISortBy } from "../../types/table";
import { IStockPositionValue } from "../../types/api";
import { TableHeaderSortDef } from "../../utils/tableHeaderSortDef";
import {
  columnVisibilityFeature,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createColumnHelper,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import QuickSearchUtils from "../../utils/quickSearchUtils";
import ImminentErrorIcon from "../../components/ImminentErrorIcon";

const sx_tableCellNumeric = {
  textAlign: "right",
};

const sx_tableSortLabel = {
  "& .MuiTableSortLabel-icon": {
    order: -1,
    marginLeft: 0,
    marginRight: 4,
  },
};

const POS_STATUS_OPEN = "open";
const POS_STATUS_CLOSED = "closed";
const POST_STATUS_ANY = "any";
const tableFeaturesConfig = tableFeatures({
  columnVisibilityFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  IStockPositionValue
>();

interface IPositionsTableProps {
  portfolioId?: string;
  recordPerPage?: number;
  isRealPortfolio: boolean;
}

export function PositionsTable({
  portfolioId,
  recordPerPage,
  isRealPortfolio,
}: IPositionsTableProps) {
  const [posStatus, setPosStatus] = useState("open");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: recordPerPage === undefined ? 25 : recordPerPage,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const pagePerRowOptions = [25, 50, 100, 250, 500];
  const [sortBy, setSortBy] = useState<ISortBy>({
    colName: null,
    isDesc: false,
  });
  const { isSuccess, isError, data, isFetching } = useQuery(
    repoPortfolio.GetPositions({
      portfolioId: portfolioId,
      posStatus: posStatus,
      sortBy: sortBy.colName,
      isDesc: sortBy.isDesc,
    }),
  );

  if (pagePerRowOptions.indexOf(pagination.pageSize) === -1) {
    pagePerRowOptions.push(pagination.pageSize);
    pagePerRowOptions.sort((a, b) => a - b); //By default javascript sort likes a string
  }

  if (isError && !data)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  let emptyRowsCount = 0;

  const columns = useMemo(
    () => {
      const tableHeaderSortDef = new TableHeaderSortDef(setSortBy);
      return columnHelper.columns([
        columnHelper.accessor("stockId", {
          header: () => (
            <TableSortLabel {...tableHeaderSortDef.get("stockId", sortBy)}>
              <Box>
                <Typography variant="body1">ID</Typography>
                <Typography variant="caption">Name</Typography>
              </Box>
            </TableSortLabel>
          ),
          cell: ({ row }) => (
            <>
              <StockTickerLink stockId={row.original.stockId} />
              <Typography variant="caption" component="p">
                {row.original.stockName}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("portfolioId", {
          header: "Portfolio",
        }),
        columnHelper.accessor("stockPrice", {
          header: () => (
            <Box>
              <Typography variant="body1">Market Price</Typography>
              <Typography variant="caption">Qty x Cost Price</Typography>
            </Box>
          ),
          meta: { isNumeric: true },
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.stockPrice ? `${row.original.currency} ` : ""}
                </Typography>
                {row.original.stockPrice?.toFixed(2) ?? ""}
              </Typography>
              <Typography variant="caption">
                {row.original.averageCost === null
                  ? "-"
                  : `${row.original.quantity} x ${row.original.averageCost.toFixed(2)}`}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("unrealisedAmount", {
          header: () => (
            <TableSortLabel
              {...tableHeaderSortDef.get("unrealisedAmount", sortBy)}
              sx={sx_tableSortLabel}
            >
              <Box>
                <Typography variant="body1">Market Value</Typography>
                <Typography variant="caption">(Qty) Cost</Typography>
              </Box>
            </TableSortLabel>
          ),
          meta: { isNumeric: true },
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.quantity === 0
                    ? ""
                    : `${row.original.currency} `}
                </Typography>
                {row.original.quantity === 0
                  ? "-"
                  : row.original.unrealisedAmount.toFixed(2)}
              </Typography>
              <Typography variant="caption">
                {row.original.quantity === 0
                  ? "-"
                  : `(${row.original.quantity}) ${row.original.unrealisedCost.toFixed(2)}`}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("realisedDividend", {
          header: () => (
            <TableSortLabel
              {...tableHeaderSortDef.get("realisedDividend", sortBy)}
              sx={sx_tableSortLabel}
            >
              <Box>
                <Typography variant="body1">Dividend</Typography>
                <Typography variant="caption">Price Date</Typography>
              </Box>
            </TableSortLabel>
          ),
          meta: { isNumeric: true },
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">{`${row.original.currency} `}</Typography>
                {row.original.realisedDividend.toFixed(2)}
              </Typography>
              <Typography variant="caption">
                {dayjs(row.original.marketDate).format("YYYY-MM-DD")}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("totalGain", {
          header: () => (
            <TableSortLabel
              {...tableHeaderSortDef.get("totalGain", sortBy)}
              sx={sx_tableSortLabel}
            >
              <Box>
                <Typography variant="body1">P&amp;L</Typography>
                <Typography variant="caption">%</Typography>
              </Box>
            </TableSortLabel>
          ),
          meta: { isNumeric: true, isGainLoss: true },
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">{`${row.original.currency} `}</Typography>
                {utils.getSignedDecimal(row.original.totalGain, 2)}
              </Typography>
              <Typography variant="caption">
                {utils.getSignedDecimal(row.original.totalGainPercentage, 2)}%
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("currentGain", {
          header: () => (
            <TableSortLabel
              {...tableHeaderSortDef.get("currentGain", sortBy)}
              sx={sx_tableSortLabel}
            >
              <Box>
                <Typography variant="body1">Daily Gain</Typography>
                <Typography variant="caption">%</Typography>
              </Box>
            </TableSortLabel>
          ),
          meta: { isNumeric: true, isGainLoss: true },
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.quantity === 0
                    ? ""
                    : `${row.original.currency} `}
                </Typography>
                {row.original.quantity === 0
                  ? "-"
                  : utils.getSignedDecimal(row.original.currentGain, 2)}
              </Typography>
              <Typography variant="caption">
                {row.original.quantity === 0
                  ? "-"
                  : `${utils.getSignedDecimal(row.original.currentGainPercentage, 2)}%`}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("unrealisedGain", {
          header: () => (
            <TableSortLabel
              {...tableHeaderSortDef.get("unrealisedGain", sortBy)}
              sx={sx_tableSortLabel}
            >
              <Box>
                <Typography variant="body1">Total Gain</Typography>
                <Typography variant="caption">%</Typography>
              </Box>
            </TableSortLabel>
          ),
          meta: { isNumeric: true, isGainLoss: true },
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.quantity === 0
                    ? ""
                    : `${row.original.currency} `}
                </Typography>
                {row.original.quantity === 0
                  ? "-"
                  : utils.getSignedDecimal(row.original.unrealisedGain, 2)}
              </Typography>
              <Typography variant="caption">
                {row.original.quantity === 0
                  ? "-"
                  : utils.getFmtSgnDec(
                    row.original.unrealisedGainPercentage,
                    2,
                    "",
                    "%",
                    "-",
                  )}
              </Typography>
            </>
          ),
        }),
      ])
    },
    [sortBy],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: data ?? [],
    state: {
      globalFilter,
      pagination,
      columnVisibility: {
        portfolioId: isRealPortfolio
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString" as const,
    getRowId: (row) => [row.portfolioId, row.stockId].join("|"),
    getColumnCanGlobalFilter: (column) =>
      ["stockId", "portfolioId"].includes(
        column.id,
      ),
    autoResetPageIndex: true,
  });

  const quickSearchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const handleQuickSearchShortcut = (event: KeyboardEvent) => {
      // If '/' is pressed while focused on quick search, blur it to let Firefox Quick Find take over
      if (QuickSearchUtils.shouldBlurQuickSearch(event, quickSearchRef.current)) {
        quickSearchRef.current?.blur();
        return; // Do not call preventDefault()
      }

      if (QuickSearchUtils.shouldHandleQuickSearchKey(event, quickSearchRef.current)) {
        event.preventDefault();
        quickSearchRef.current?.focus();
        quickSearchRef.current?.select();
      }
    };

    document.addEventListener("keydown", handleQuickSearchShortcut);
    return () => {
      document.removeEventListener("keydown", handleQuickSearchShortcut);
    };
  }, []);

  const rows = table.getRowModel().rows;
  const totalVisibleRows = table.getFilteredRowModel().rows.length;
  emptyRowsCount = utils.getEmptyRowsCountForLastPage({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    rowCount: totalVisibleRows,
    currentPageRowCount: rows.length,
  });

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <DefaultPaper>
        <Grid container sx={{ justifyContent: "space-between" }}>
          <Grid size="grow">
            <Typography variant="h6" gutterBottom>
              Details {isError && <ImminentErrorIcon />}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={1} sx={{ justifyContent: "space-between" }}>
          <Grid size={{ xs: 12, sm: "grow" }}>
            <ButtonGroup
              variant="outlined"
              aria-label="outlined button group"
            >
              <Button
                disabled={posStatus === POS_STATUS_OPEN}
                onClick={() => {
                  setPosStatus(POS_STATUS_OPEN);
                }}
              >
                Open
              </Button>
              <Button
                disabled={posStatus === POS_STATUS_CLOSED}
                onClick={() => {
                  setPosStatus(POS_STATUS_CLOSED);
                }}
              >
                Closed
              </Button>
              <Button
                disabled={posStatus === POST_STATUS_ANY}
                onClick={() => {
                  setPosStatus(POST_STATUS_ANY);
                }}
              >
                Any
              </Button>
            </ButtonGroup>
          </Grid>

          <Grid size={{ xs: 12, sm: 'auto' }}>
            <TextField
              inputRef={quickSearchRef}
              size="small"
              fullWidth
              label="Quick Search"
              value={globalFilter}
              onChange={(event) => {
                table.setGlobalFilter(event.target.value);
              }}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      sx={
                        header.column.columnDef.meta?.isNumeric
                          ? sx_tableCellNumeric
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {!isSuccess && (
                <TableSkeletonCells
                  rowsPerPage={pagination.pageSize}
                  colCount={table.getVisibleFlatColumns().length}
                  rowKeyPrefix="positions-"
                />
              )}

              {isSuccess &&
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      return (
                        <TableCell
                          key={cell.id}
                          sx={{
                            ...(meta?.isNumeric ? sx_tableCellNumeric : {}),
                            ...(meta?.isGainLoss ? utils.getColorClass(cell.getValue() as number) : {}),
                          }}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              {emptyRowsCount > 0 && (
                <TableRow sx={{ height: 33.0167 * emptyRowsCount }}>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={pagePerRowOptions}
          component="div"
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={pagination.pageSize}
          page={pagination.pageIndex}
          onPageChange={(_event, newPage) =>
            setPagination((prev) => ({ ...prev, pageIndex: newPage }))
          }
          onRowsPerPageChange={(event) => {
            setPagination({
              pageIndex: 0,
              pageSize: parseInt(event.target.value, 10),
            });
          }}
        />
      </DefaultPaper>
    </>
  );
}
