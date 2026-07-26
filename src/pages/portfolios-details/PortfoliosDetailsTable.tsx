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
import Typography from "@mui/material/Typography";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DefaultErrorPlaceholder,
  DefaultPaper,
  DefaultLinearProgress,
} from "../../components/DefaultComponents";
import { Grid, Tooltip } from "@mui/material";
import TableSkeletonCells from "../../components/TableSkeletonCells";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import ConfirmationDialogWrapper from "../../components/ConfirmationDialogWrapper";
import EditFormPortfolio from "./EditFormPortfolio";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  postErrorMessage,
  postSuccessMessage,
} from "../../redux/snackbarSlice";
import repoPortfolio from "../../repo/repoPortfolio";
import { IStockSummary } from "../../types/api";
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
import { width } from "@mui/system";
import QuickSearchUtils from "../../utils/quickSearchUtils";

const sx_tableCellNumeric = {
  textAlign: "right",
};

const sx_iconButton = {
  padding: 0,
  marginLeft: 0.5,
};

const POS_STATUS_OPEN = "open";
const POS_STATUS_CLOSED = "closed";
const POST_STATUS_VIRTUAL = "virtual";
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
  IStockSummary
>();
type IStockSummaryColumnKey = keyof IStockSummary;

const numericColumnIds = new Set<IStockSummaryColumnKey>([
  "totalCost",
  "totalUnrealisedAmount",
  "totalRealisedAmount",
  "totalDividend",
  "totalRealisedGain",
  "totalUnrealisedGain",
  "curTxGainAmount",
]);

const getCellSx = (
  columnId: IStockSummaryColumnKey,
  row: IStockSummary,
) => ({
  ...(numericColumnIds.has(columnId) ? sx_tableCellNumeric : {}),
  ...(columnId === "totalRealisedGain"
    ? utils.getColorClass(row.totalRealisedGain)
    : {}),
  ...(columnId === "totalUnrealisedGain"
    ? utils.getColorClass(row.totalUnrealisedGain)
    : {}),
  ...(columnId === "curTxGainAmount"
    ? utils.getColorClass(row.curTxGainAmount)
    : {}),
});

interface IPortfoliosDetailsTableProps {
  recordPerPage?: number | undefined;
}

export default function PortfoliosDetailsTable({
  recordPerPage,
}: IPortfoliosDetailsTableProps) {
  const [posStatus, setPosStatus] = useState(POS_STATUS_OPEN);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: recordPerPage === undefined ? 25 : recordPerPage,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const pagePerRowOptions = [25, 50, 100, 250, 500];
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    content: IStockSummary | null;
  }>({ isOpen: false, content: null });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const deleteMutation = useMutation({
    mutationFn: async ({ portfolioId }: { portfolioId: string }) => {
      const deleteQuery = repoPortfolio.Delete({ portfolioId });
      return {
        response: await deleteQuery.requestFn(),
        invalidateQueryKey: deleteQuery.invalidateQueryKey,
      };
    },
    onSuccess: async ({ invalidateQueryKey }) => {
      dispatch(postSuccessMessage(""));
      await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (error: AxiosError<any>) => {
      dispatch(postErrorMessage(utils.getApiErrorMessage(error)));
    },
  });

  if (pagePerRowOptions.indexOf(pagination.pageSize) === -1) {
    pagePerRowOptions.push(pagination.pageSize);
    pagePerRowOptions.sort((a, b) => a - b); //By default javascript sort likes a string
  }

  const { isSuccess, isError, data, isFetching } = useQuery(
    repoPortfolio.GetSummary(),
  );

  if (isError)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  let emptyRowsCount = 0;
  let predata: IStockSummary[] = [];

  if (isSuccess) {
    switch (posStatus) {
      case POS_STATUS_OPEN:
        predata = data.details;
        break;
      case POS_STATUS_CLOSED:
        predata = data.closedDetails;
        break;
      case POST_STATUS_VIRTUAL:
        predata = data.virtualPortfolioDetails;
        break;
    }
  }

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("portfolioName", {
          header: "Name",
        }),
        columnHelper.accessor("totalCost", {
          header: "Cost",
          cell: ({ row }) => (
            <Typography variant="body1">
              <Typography variant="caption">
                {row.original.displayCurrency + " "}
              </Typography>
              {row.original.totalCost.toFixed(2)}
            </Typography>
          ),
        }),
        columnHelper.accessor("totalUnrealisedAmount", {
          header: "Unrealised Amount",
          cell: ({ row }) => (
            <Typography variant="body1">
              <Typography variant="caption">
                {row.original.displayCurrency + " "}
              </Typography>
              {row.original.totalUnrealisedAmount.toFixed(2)}
            </Typography>
          ),
        }),
        columnHelper.accessor("totalRealisedAmount", {
          header: "Realised Amount",
          cell: ({ row }) => (
            <Typography variant="body1">
              <Typography variant="caption">
                {row.original.displayCurrency + " "}
              </Typography>
              {row.original.totalRealisedAmount.toFixed(2)}
            </Typography>
          ),
        }),
        columnHelper.accessor("totalDividend", {
          header: "Realised Dividend",
          cell: ({ row }) => (
            <Typography variant="body1">
              <Typography variant="caption">
                {row.original.displayCurrency + " "}
              </Typography>
              {row.original.totalDividend.toFixed(2)}
            </Typography>
          ),
        }),
        columnHelper.accessor("totalRealisedGain", {
          header: "Realised Gain",
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.displayCurrency + " "}
                </Typography>
                {utils.getSignedDecimal(row.original.totalRealisedGain, 2)}
              </Typography>
              <Typography variant="caption">
                {utils.getFmtSgnDec(
                  row.original.totalRealisedGainPercentage,
                  2,
                  "",
                  "%",
                  "-",
                )}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("totalUnrealisedGain", {
          header: "Unrealised Gain",
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.displayCurrency + " "}
                </Typography>
                {utils.getSignedDecimal(row.original.totalUnrealisedGain, 2)}
              </Typography>
              <Typography variant="caption">
                {utils.getFmtSgnDec(
                  row.original.totalUnrealisedGainPercentage,
                  2,
                  "",
                  "%",
                  "-",
                )}
              </Typography>
            </>
          ),
        }),
        columnHelper.accessor("curTxGainAmount", {
          header: "Daily Gain",
          cell: ({ row }) => (
            <>
              <Typography variant="body1">
                <Typography variant="caption">
                  {row.original.displayCurrency + " "}
                </Typography>
                {utils.getSignedDecimal(row.original.curTxGainAmount, 2)}
              </Typography>
              <Typography variant="caption">
                {utils.getFmtSgnDec(
                  row.original.curTxGainAmountPercentage,
                  2,
                  "",
                  "%",
                  "-",
                )}
              </Typography>
            </>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: "Action",
          cell: ({ row }) => {
            const d = row.original;
            return (
              <Grid container wrap="nowrap" sx={{ alignItems: "center" }}>
                <Tooltip title="Edit" aria-label="Edit">
                  <IconButton
                    size="small"
                    aria-label="edit"
                    sx={sx_iconButton}
                    disabled={isFetching}
                    onClick={() => setDialogState({ isOpen: true, content: d })}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <ConfirmationDialogWrapper
                  disabled={isFetching}
                  WrappingComponent={(props) => (
                    <Tooltip title="Delete" aria-label="Delete">
                      <IconButton
                        size="small"
                        aria-label="delete"
                        sx={sx_iconButton}
                        disabled={props.disabled}
                        onClick={props.onClick}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                  title="Confirmation"
                  description="Are you sure to delete this record ?"
                  onDialogConfirm={async () => {
                    await deleteMutation.mutateAsync({
                      portfolioId: d.portfolioId,
                    });
                  }}
                />
              </Grid>
            );
          },
        }),
      ]),
    [isFetching, deleteMutation.mutateAsync],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: predata,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString" as const,
    getColumnCanGlobalFilter: (column) => column.id === "portfolioName",
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
              Details
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
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              >
                Open
              </Button>
              <Button
                disabled={posStatus === POS_STATUS_CLOSED}
                onClick={() => {
                  setPosStatus(POS_STATUS_CLOSED);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              >
                Closed
              </Button>
              <Button
                disabled={posStatus === POST_STATUS_VIRTUAL}
                onClick={() => {
                  setPosStatus(POST_STATUS_VIRTUAL);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              >
                Virtual
              </Button>
            </ButtonGroup>
          </Grid>

          <Grid container size={{ xs: "grow", sm: 'auto' }}>
            <Grid size={{ xs: "grow" }}>
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

            <Grid>
              <Tooltip title="Add" aria-label="Add">
                <IconButton
                  onClick={() => {
                    setDialogState({ isOpen: true, content: null });
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Grid>
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
                        numericColumnIds.has(header.column.id as IStockSummaryColumnKey)
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
                  rowKeyPrefix="portfolio-details-"
                />
              )}

              {isSuccess &&
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        sx={getCellSx(cell.column.id as IStockSummaryColumnKey, row.original)}
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
      </DefaultPaper >
      <Dialog open={dialogState.isOpen} aria-labelledby="form-dialog-title">
        <EditFormPortfolio
          onDialogClose={() => setDialogState({ isOpen: false, content: null })}
          data={dialogState.content}
        />
      </Dialog>
    </>
  );
}
