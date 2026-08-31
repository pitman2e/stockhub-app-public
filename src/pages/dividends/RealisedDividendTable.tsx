import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import utils from "../../utils/utils";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/Error";
import Tooltip from "@mui/material/Tooltip";
import StockTickerLink from "../../components/StockTickerLink";
import {
  DefaultErrorPlaceholder,
  DefaultLinearProgress,
  DefaultPaper,
} from "../../components/DefaultComponents";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import RealisedDividendChart from "./RealisedDividendChart";
import repoRealisedDividend from "../../repo/repoRealisedDividend";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditFormDividend from "./EditFormDividend";
import EditFormTrans from "../transactions/EditFormTrans";
import TableSkeletonCells from "../../components/TableSkeletonCells";
import { IRealisedScripPutDto } from "../../types/api";
import { ITransactionGetDto } from "../../types/api";
import { RealisedDividend } from "../../types/db";
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

interface IRealisedDividendTableProps {
  portfolioId?: string;
  filterStockId: string;
  filterMarket?: string;
}

const sx_tableCellNumeric = {
  textAlign: "right",
};

const sx_iconButton = {
  padding: 0,
  marginLeft: 0.5,
};

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
  RealisedDividend
>();

export default function RealisedDividendTable({
  portfolioId,
  filterStockId,
  filterMarket,
}: IRealisedDividendTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStateTran, setDialogStateTran] = useState<{
    isOpen: boolean;
    content: ITransactionGetDto | null;
  }>({ isOpen: false, content: null });
  const [editScripDividendData, setEditScripDividendData] =
    useState<IRealisedScripPutDto | null>(null);
  const realisedQuery = repoRealisedDividend.Get({
    portfolioId: portfolioId,
    stockId: filterStockId,
    market: filterMarket,
  });

  const { isError, data, isFetching } = useQuery(realisedQuery);

  const onDialogClose = () => {
    setIsDialogOpen(false);
  };

  if (isError && !data)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  const columns = useMemo(
    () => {
      const now = dayjs();
      return columnHelper.columns([
        columnHelper.accessor("stockId", {
          header: "ID",
          cell: ({ getValue }) => (
            <StockTickerLink stockId={String(getValue())} />
          ),
        }),
        columnHelper.accessor("stockName", { header: "Name" }),
        ...(!portfolioId
          ? [columnHelper.accessor("portfolioId", { header: "Portfolio" })]
          : []),
        columnHelper.accessor("exDate", {
          header: "Ex Date",
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <Grid container wrap="nowrap" sx={{ alignItems: "center" }}>
                {dayjs(value).format("YYYY-MM-DD")}
                {dayjs(value).isAfter(now) ? (
                  <HourglassEmptyIcon fontSize="small" />
                ) : null}
              </Grid>
            );
          },
        }),
        columnHelper.accessor("payDate", {
          header: "Pay Date",
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <Grid container wrap="nowrap" sx={{ alignItems: "center" }}>
                {dayjs(value).format("YYYY-MM-DD")}
                {dayjs(value).isAfter(now) ? (
                  <HourglassEmptyIcon fontSize="small" />
                ) : null}
              </Grid>
            );
          },
        }),
        columnHelper.accessor("dividendType", { header: "Ty" }),
        columnHelper.accessor("cnt", {
          header: "Payable Unit",
          meta: { isNumeric: true },
          cell: ({ getValue }) => {
            const value = getValue<number | null | undefined>();
            return value?.toFixed(2) ?? "-";
          },
        }),
        columnHelper.accessor("payPerUnit", {
          header: "Amt/Unit",
          meta: { isNumeric: true },
          cell: ({ row, getValue }) => {
            const value = getValue<number | null | undefined>();
            return (
              <>
                <Typography variant="caption">{row.original.currency + " "}</Typography>
                {value?.toFixed(2) ?? "-"}
              </>
            );
          },
        }),
        columnHelper.accessor("dividendYield", {
          header: "Yd",
          meta: { isNumeric: true },
          cell: ({ getValue }) => {
            const value = getValue<number | null | undefined>();
            return utils.getFmtDec(value, 2, "", "%", "-");
          },
        }),
        columnHelper.accessor("amountAdjPercentage", {
          header: "Adj",
          meta: { isNumeric: true, isGainLoss: true },
          cell: ({ getValue }) => {
            const value = getValue<number | null | undefined>();
            return value ? utils.getSignedDecimal(value, 2) + "%" : "-";
          },
        }),
        columnHelper.accessor("scripReceived", {
          header: "Scrip Re'd",
          meta: { isNumeric: true },
          cell: ({ row, getValue }) => {
            const value = getValue<number | null | undefined>();
            const isScripDistribution =
              row.original.distributionType.indexOf("Scrip") >= 0;

            return (
              <Grid
                container
                wrap="nowrap"
                sx={{ alignItems: "center", justifyContent: "flex-end" }}
              >
                {isScripDistribution ? value ?? "-" : "-"}
                {isScripDistribution &&
                  row.original.distributionType.indexOf("Cash") >= 0 ? (
                  <IconButton
                    aria-label="edit"
                    sx={sx_iconButton}
                    size="small"
                    onClick={() => {
                      setEditScripDividendData(row.original);
                      setIsDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                ) : null}
              </Grid>
            );
          },
        }),
        columnHelper.accessor("reinvestPrice", {
          header: "Reinv Price",
          meta: { isNumeric: true },
          cell: ({ getValue }) => {
            const value = getValue<number | null | undefined>();
            return value ? value.toFixed(4) : "-";
          },
        }),
        columnHelper.accessor("totalAmt", {
          header: "Total Amt",
          meta: { isNumeric: true },
          cell: ({ row, getValue }) => {
            const value = getValue<number | null | undefined>();

            if (row.original.isMissingScripPrice) {
              return (
                <Tooltip title="Missing Scrip Price">
                  <ErrorIcon sx={sx_iconButton} fontSize="small" />
                </Tooltip>
              );
            }

            return (
              <Grid
                container
                wrap="nowrap"
                sx={{ alignItems: "center", justifyContent: "flex-end" }}
              >
                <Typography variant="caption">{row.original.currency}&nbsp;</Typography>
                <Typography variant="inherit">
                  {value?.toFixed(2) ?? "-"}
                </Typography>
              </Grid>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "Action",
          cell: ({ row }) => {
            const d = row.original;
            return (
              <Grid container wrap="nowrap">
                <IconButton
                  size="small"
                  aria-label="copy"
                  sx={sx_iconButton}
                  disabled={isFetching}
                  onClick={() => {
                    const unitAmt = d.scripReceived
                      ? (d.reinvestPrice ?? utils.round2Dec(d.totalAmt / d.scripReceived, 4))
                      : d.payPerUnit;
                    const txCount = d.scripReceived ? d.scripReceived : d.cnt;

                    const content: ITransactionGetDto = {
                      iden: -1,
                      stockId: d.stockId,
                      portfolioId: d.portfolioId,
                      currency: d.currency,
                      txDate: d.payDate,
                      tranType: d.scripReceived ? "REINV" : "DIV",
                      unitAmt: unitAmt,
                      txCount: txCount,
                      tax:
                        d.stockId.endsWith(".US") && !d.scripReceived
                          ? -utils.round2Dec(unitAmt * txCount * 0.3, 4)
                          : null,
                      isTransfer: false,
                      version: 0,
                    };
                    setDialogStateTran({
                      isOpen: true,
                      content: content,
                    });
                  }}
                >
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              </Grid>
            );
          },
        }),
      ])
    },
    [isFetching, portfolioId],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: data ?? [],
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString" as const,
    autoResetPageIndex: true,
    getColumnCanGlobalFilter: (column) =>
      [
        "stockId",
        "stockName",
        "portfolioId",
        "exDate",
        "payDate",
        "dividendType",
      ].includes(column.id),
    getRowId: (row) => [row.portfolioId, row.stockId, row.payDate].join("|"),
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
  const emptyRowsCount = utils.getEmptyRowsCountForLastPage({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    rowCount: totalVisibleRows,
    currentPageRowCount: rows.length,
  });

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <RealisedDividendChart
          portfolioId={portfolioId}
          stockId={filterStockId}
        ></RealisedDividendChart>
      </Grid>

      <Grid size={{ xs: 12 }}>
        {isFetching && <DefaultLinearProgress />}
        <DefaultPaper>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 12, sm: 'grow' }}>
              <Typography id="tableLabel" variant="h6">
                Realised Dividends {isError && <ImminentErrorIcon />}
              </Typography>
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
                {data === undefined && (
                  <TableSkeletonCells
                    rowsPerPage={pagination.pageSize}
                    colCount={table.getVisibleFlatColumns().length}
                    rowKeyPrefix="realised-dividend-"
                  />
                )}

                {rows.map((row) => (
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
                    <TableCell colSpan={15} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
          
          {isDialogOpen && editScripDividendData !== null && (
            <EditFormDividend
              onDialogClose={onDialogClose}
              data={editScripDividendData}
            ></EditFormDividend>
          )}

          {dialogStateTran.isOpen && (
            <EditFormTrans
              onDialogClose={() =>
                setDialogStateTran({ isOpen: false, content: null })
              }
              content={dialogStateTran.content}
              isAllowClone={true}
            />
          )}
        </DefaultPaper>
      </Grid>
    </Grid>
  );
}
