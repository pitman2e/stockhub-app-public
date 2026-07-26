import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import {
  DefaultPaper,
  DefaultErrorPlaceholder,
  DefaultLinearProgress,
} from "../../components/DefaultComponents";
import ConfirmationDialogWrapper from "../../components/ConfirmationDialogWrapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Tooltip from "@mui/material/Tooltip";
import CommentIcon from "@mui/icons-material/Comment";
import { useDispatch } from "react-redux";
import EditFormTrans from "./EditFormTrans";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TableSkeletonCells from "../../components/TableSkeletonCells";
import AddIcon from "@mui/icons-material/Add";

import {
  postErrorMessage,
  postSuccessMessage,
} from "../../redux/snackbarSlice";
import { ITransactionGetDto } from "../../types/api";
import repoPortfolio from "../../repo/repoPortfolio";
import repoStockTransaction from "../../repo/repoStockTransaction";
import DateRangeSelector from "../../components/DateRangeSelector";
import MarketSelect from "../../components/MarketSelect";
import TransactionTypeSelect from "../../components/TransactionTypeSelect";
import utils from "../../utils/utils";
import { Box, Stack } from "@mui/system";
import StockIdAutocomplete from "../../components/StockIdAutocomplete";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
import { AxiosError } from "axios";
import QuickSearchUtils from "../../utils/quickSearchUtils";

const sx_tableCellNumeric = {
  textAlign: "right",
};

const sx_iconButton = {
  padding: 0,
  marginLeft: 0.5,
};

interface StockTransactionTableProps {
  portfolioId: string | undefined;
}

const tableFeaturesConfig = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  ITransactionGetDto
>();

export default function StockTransactionTable({
  portfolioId,
}: StockTransactionTableProps) {
  const [dateRange, setDateRange] = useState<{
    fmDate: number | null;
    toDate: number | null;
  }>({ fmDate: null, toDate: null });
  const [market, setMarket] = useState<string>("");
  const [txType, setTxType] = useState<string>("");
  const [stockId, setStockId] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const pagePerRowOptions = [25, 50, 100, 250, 500];

  // TODO: Workaround table at high page number that does not exists after applying filter
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [stockId, txType, market, dateRange]);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    content: ITransactionGetDto | null;
  }>({ isOpen: false, content: null });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const deleteMutation = useMutation({
    mutationFn: async ({
      portfolioId,
      iden,
    }: {
      portfolioId: string;
      iden: number;
    }) => {
      const deleteQuery = repoStockTransaction.Delete({ portfolioId, iden });
      return {
        response: await deleteQuery.requestFn(),
        invalidateQueryKeys: deleteQuery.invalidateQueryKeys,
      };
    },
    onSuccess: async ({ invalidateQueryKeys }) => {
      dispatch(postSuccessMessage(""));
      await Promise.all(
        invalidateQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
    onError: (error: AxiosError<any>) => {
      dispatch(postErrorMessage(utils.getApiErrorMessage(error)));
    },
  });

  const queryFilterDict = {
    portfolioId: portfolioId,
    stockId: stockId,
    transactionType: txType,
    market: market,
    fmDate: dateRange.fmDate,
    toDate: dateRange.toDate,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  };

  const { isSuccess, isError, data, isFetching } = useQuery({
    ...repoStockTransaction.Get(queryFilterDict),
    staleTime: 5 * 60 * 1000,
  });

  // Precache the next query
  useQuery({
    ...repoStockTransaction.Get({
      ...queryFilterDict,
      offset: queryFilterDict.offset + queryFilterDict.limit,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: portfolioData } = useQuery(repoPortfolio.Get());

  if (pagePerRowOptions.indexOf(pagination.pageSize) === -1) {
    pagePerRowOptions.push(pagination.pageSize);
    pagePerRowOptions.sort((a, b) => a - b);
  }

  if (isError)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  let emptyRowsCount = 0;

  const portfolios =
    portfolioData === undefined
      ? []
      : portfolioData.filter((p) => p.portfolioId === portfolioId);
  const isRealPortfolio = portfolios.length === 1 && !portfolios[0].isVirtual;

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("txDate", {
          id: "txDate",
          header: "Date",
          cell: (info) => {
            const txDate = info.getValue();
            return (
              <Grid container wrap="nowrap" sx={{ alignItems: "center" }}>
                {dayjs(txDate).format("YYYY-MM-DD")}
                {dayjs(txDate).isAfter(dayjs()) ? (
                  <HourglassEmptyIcon fontSize="small" />
                ) : (
                  ""
                )}
              </Grid>
            );
          },
        }),
        columnHelper.accessor("stockId", {
          id: "stockId",
          header: "ID",
        }),
        columnHelper.accessor("stockName", {
          id: "stockName",
          header: "Name",
        }),
        ...(!isRealPortfolio
          ? [
              columnHelper.accessor("portfolioId", {
                id: "portfolioId",
                header: "Portfolio",
              }),
            ]
          : []),
        columnHelper.accessor("tranType", {
          id: "tranType",
          header: "Type",
        }),
        columnHelper.accessor("handlingFee", {
          id: "handlingFee",
          header: "Fee",
          meta: { isNumeric: true },
          cell: (info) => {
            const fee = info.getValue();
            const currency = info.row.original.currency;
            return (
              <>
                <Typography variant="caption">
                  {fee ? currency + " " : ""}
                </Typography>
                {fee ? fee.toFixed(2) : "-"}
              </>
            );
          },
        }),
        columnHelper.accessor("tax", {
          id: "tax",
          header: "Tax",
          meta: { isNumeric: true },
          cell: (info) => {
            const tax = info.getValue();
            const currency = info.row.original.currency;
            return (
              <>
                <Typography variant="caption">
                  {tax ? currency + " " : ""}
                </Typography>
                {tax ? tax.toFixed(2) : "-"}
              </>
            );
          },
        }),
        columnHelper.accessor("accruedInterest", {
          id: "accruedInterest",
          header: "Acur.Int",
          meta: { isNumeric: true },
          cell: (info) => {
            const accruedInterest = info.getValue();
            const currency = info.row.original.currency;
            return (
              <>
                <Typography variant="caption">
                  {accruedInterest ? currency + " " : ""}
                </Typography>
                {accruedInterest ? accruedInterest.toFixed(2) : "-"}
              </>
            );
          },
        }),
        columnHelper.accessor("unitAmt", {
          id: "unitAmt",
          header: "Unit Amt",
          meta: { isNumeric: true },
          cell: (info) => {
            const unitAmt = info.getValue();
            const currency = info.row.original.currency;
            return (
              <>
                <Typography variant="caption">{currency + " "}</Typography>
                {unitAmt.toFixed(2)}
              </>
            );
          },
        }),
        columnHelper.accessor("txCount", {
          id: "txCount",
          header: "Count",
          meta: { isNumeric: true },
        }),
        columnHelper.display({
          id: "amount",
          header: "Amt * Cnt",
          meta: { isNumeric: true },
          cell: (info) => {
            const d = info.row.original;
            return (
              <>
                <Typography variant="caption">{d.currency + " "}</Typography>
                {(d.unitAmt * d.txCount).toFixed(2)}
              </>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "Action",
          cell: (info) => {
            const d = info.row.original;
            return (
              <Grid container wrap="nowrap" sx={{ alignItems: "center" }}>
                <Tooltip title="Edit" aria-label="Edit">
                  <IconButton
                    size="small"
                    aria-label="edit"
                    sx={sx_iconButton}
                    disabled={isFetching}
                    onClick={() => {
                      setDialogState({ isOpen: true, content: d });
                    }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>

                <ConfirmationDialogWrapper
                  disabled={isFetching}
                  WrappingComponent={(props) => {
                    return (
                      <Tooltip title="Delete" aria-label="Delete">
                        <IconButton
                          size="small"
                          sx={sx_iconButton}
                          disabled={props.disabled}
                          onClick={props.onClick}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    );
                  }}
                  title="Confirmation"
                  description="Are you sure to delete this record ?"
                  onDialogConfirm={async () => {
                    await deleteMutation.mutateAsync({
                      portfolioId: d.portfolioId,
                      iden: d.iden,
                    });
                  }}
                  onDialogCancel={null}
                />

                {d.comment && (
                  <Tooltip title={d.comment} aria-label="view-comment">
                    <IconButton
                      size="small"
                      aria-label="view-comment"
                      sx={sx_iconButton}
                    >
                      <CommentIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            );
          },
        }),
      ]),
    [isRealPortfolio, isFetching, deleteMutation]
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: isSuccess ? data.tableData : [],
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: data?.totalCount ?? 0,
    globalFilterFn: "includesString" as const,
    getColumnCanGlobalFilter: (column) =>
      ["date", "stockId", "stockName", "portfolioId", "tranType"].includes(
        column.id,
      ),
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
  if (isSuccess) {
    emptyRowsCount = utils.getEmptyRowsCountForLastPage({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      rowCount: data?.totalCount ?? 0,
      currentPageRowCount: rows.length,
    });
  }

  return (
    <Stack spacing={1}>
      <DefaultPaper>
        <Grid container spacing={1} size={{ xs: 12 }}>
          <Grid size={{ xs: 12 }}>
            <ListItemButton onClick={() => setFiltersOpen((prev) => !prev)}>
              <ListItemText
                primary={<Typography variant="h6">Filtering</Typography>}
              />
              {filtersOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
              <Grid container spacing={1} size={{ xs: 12 }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <StockIdAutocomplete
                    portfolioId={portfolioId}
                    SetStateAction={setStockId}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 2 }}>
                  <TransactionTypeSelect SetStateAction={setTxType} />
                </Grid>

                <Grid size={{ xs: 6, sm: 2 }}>
                  <MarketSelect SetStateAction={setMarket} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <DateRangeSelector
                    SetStateAction={setDateRange}
                    DefaultPreset="-"
                    IsNullable={true}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </DefaultPaper>

      <Box>
        {isFetching && <DefaultLinearProgress />}
        <DefaultPaper>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 12, sm: "grow" }}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
            </Grid>

            <Grid container size={{ xs: 12, sm: 'auto' }}>
              <Grid size={{ xs: 'grow', sm: 'auto' }}>
                <TextField
                  inputRef={quickSearchRef}
                  size="small"
                  fullWidth
                  label="Quick Search"
                  value={globalFilter}
                  onChange={(event) => {
                    table.setGlobalFilter(event.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                />
              </Grid>

              {isRealPortfolio && (
                <Grid>
                  <IconButton
                    onClick={() => {
                      setDialogState({ isOpen: true, content: null });
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>
              )}
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
                  />
                )}

                {isSuccess &&
                  rows.map((row) => (
                    <TableRow hover key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          sx={
                            cell.column.columnDef.meta?.isNumeric
                              ? sx_tableCellNumeric
                              : undefined
                          }
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
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
            count={data?.totalCount ?? 0}
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

          {dialogState.isOpen && (
            <EditFormTrans
              onDialogClose={() =>
                setDialogState({ isOpen: false, content: null })
              }
              content={dialogState.content}
              defaultPortfolioId={portfolioId}
              defaultStockId={stockId}
              isAllowClone={dialogState.content !== null}
            />
          )}
        </DefaultPaper>
      </Box>
    </Stack>
  );
}
