import { useMemo, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
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
import { Box, TableSortLabel } from "@mui/material";
import { ISortBy } from "../../types/table";
import { IStockPositionValue } from "../../types/api";
import { TableHeaderSortDef } from "../../utils/tableHeaderSortDef";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

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
const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  IStockPositionValue
>();

interface IPositionsTableProps {
  portfolioId: string | undefined;
  recordPerPage?: number | undefined;
  isShowPortfolioId: boolean;
}

export function PositionsTable({
  portfolioId,
  recordPerPage,
  isShowPortfolioId,
}: IPositionsTableProps) {
  const [posStatus, setPosStatus] = useState("open");
  const [pageNo, setPageNo] = useState(0); //State Hook
  const [rowsPerPage, setRowsPerPage] = useState(
    recordPerPage === undefined ? 25 : recordPerPage,
  );
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

  const tableHeaderSortDef = new TableHeaderSortDef(setSortBy);

  if (pagePerRowOptions.indexOf(rowsPerPage) === -1) {
    pagePerRowOptions.push(rowsPerPage);
    pagePerRowOptions.sort((a, b) => a - b); //By default javascript sort likes a string
  }

  if (isError)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  let emptyRowsCount = 0;
  let data2Show: NonNullable<typeof data> = [];

  if (isSuccess) {
    data2Show = data.slice(
      pageNo * rowsPerPage,
      Math.min((pageNo + 1) * rowsPerPage, data.length),
    );
    emptyRowsCount =
      data.length <= rowsPerPage
        ? 0
        : (pageNo + 1) * rowsPerPage -
          Math.min((pageNo + 1) * rowsPerPage, data.length);
  }

  const columns = useMemo(
    () =>
      columnHelper.columns([
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
        ...(isShowPortfolioId
          ? [
              columnHelper.accessor("portfolioId", {
                header: "Portfolio",
              }),
            ]
          : []),
        columnHelper.accessor("stockPrice", {
          header: () => (
            <Box>
              <Typography variant="body1">Market Price</Typography>
              <Typography variant="caption">Qty x Cost Price</Typography>
            </Box>
          ),
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
      ]),
    [isShowPortfolioId, sortBy],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: isSuccess ? data : [],
  });
  const rows = table.getRowModel().rows;
  const rows2Show = rows.slice(
    pageNo * rowsPerPage,
    Math.min((pageNo + 1) * rowsPerPage, rows.length),
  );
  const emptyRowsCountFromTable =
    rows.length <= rowsPerPage
      ? 0
      : (pageNo + 1) * rowsPerPage -
        Math.min((pageNo + 1) * rowsPerPage, rows.length);
  const colCount = columns.length;

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <DefaultPaper>
        <Typography variant="h6" gutterBottom>
          Details
        </Typography>

        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <Button
            disabled={posStatus === POS_STATUS_OPEN}
            onClick={() => setPosStatus(POS_STATUS_OPEN)}
          >
            Open
          </Button>
          <Button
            disabled={posStatus === POS_STATUS_CLOSED}
            onClick={() => setPosStatus(POS_STATUS_CLOSED)}
          >
            Closed
          </Button>
          <Button
            disabled={posStatus === POST_STATUS_ANY}
            onClick={() => setPosStatus(POST_STATUS_ANY)}
          >
            Any
          </Button>
        </ButtonGroup>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      sx={
                        header.column.id !== "stockId" &&
                        header.column.id !== "portfolioId"
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
                  rowsPerPage={rowsPerPage}
                  colCount={colCount}
                  rowKeyPrefix="positions-"
                />
              )}

              {isSuccess &&
                rows2Show.map((row) => (
                  <TableRow hover key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        sx={{
                          ...(cell.column.id !== "stockId" &&
                          cell.column.id !== "portfolioId"
                            ? sx_tableCellNumeric
                            : {}),
                          ...(cell.column.id === "totalGain"
                            ? utils.getColorClass(row.original.totalGain)
                            : {}),
                          ...(cell.column.id === "currentGain"
                            ? utils.getColorClass(
                                row.original.quantity === 0
                                  ? 0
                                  : row.original.currentGainPercentage,
                              )
                            : {}),
                          ...(cell.column.id === "unrealisedGain"
                            ? utils.getColorClass(row.original.unrealisedGain)
                            : {}),
                        }}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {emptyRowsCount > 0 && (
                <TableRow sx={{ height: 33.0167 * emptyRowsCount }}>
                  <TableCell colSpan={colCount} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={pagePerRowOptions}
          component="div"
          count={data?.length ?? 0}
          rowsPerPage={rowsPerPage}
          page={pageNo}
          onPageChange={(_event, newpage) => setPageNo(newpage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPageNo(0);
          }}
        />
      </DefaultPaper>
    </>
  );
}
