import { useEffect, useMemo, useRef, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery } from "@tanstack/react-query";
import repoStocks from "../../repo/repoStocks";
import {
  DefaultErrorPlaceholder,
  DefaultPaper,
  DefaultLinearProgress,
} from "../../components/DefaultComponents";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import EditFormStock from "./EditFormStock";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import utils from "../../utils/utils";
import StockTickerLink from "../../components/StockTickerLink";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch } from "react-redux";
import ConfirmationDialogWrapper from "../../components/ConfirmationDialogWrapper";
import {
  postErrorMessage,
  postSuccessMessage,
} from "../../redux/snackbarSlice";
import { IStock } from "../../types/db";
import TableSkeletonCells from "../../components/TableSkeletonCells";
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
import { Tooltip } from "@mui/material";
import QuickSearchUtils from "../../utils/quickSearchUtils";
import ImminentErrorIcon from "../../components/ImminentErrorIcon";

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
const columnHelper = createColumnHelper<typeof tableFeaturesConfig, IStock>();

interface IStocksTableProps {
  recordPerPage?: number;
  assetClasses: string[];
}

export default function StocksTable({
  recordPerPage,
  assetClasses,
}: IStocksTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: recordPerPage === undefined ? 25 : recordPerPage,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const pagePerRowOptions = [25, 50, 100, 250, 500];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toEditData, setToEditData] = useState<IStock | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const deleteMutation = useMutation({
    mutationFn: async ({ stockId }: { stockId: string }) => {
      const deleteQuery = repoStocks.Delete();
      return {
        response: await deleteQuery.requestFn({ stockId }),
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

  const dataQuery = repoStocks.Get({
    isOrderByPosVal: true,
    assetClasses: assetClasses.join(","),
  });

  const { isSuccess, isError, data, isFetching } = useQuery(dataQuery);

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
    () =>
      columnHelper.columns([
        columnHelper.accessor("stockId", {
          header: "Ticker Id",
          cell: ({ row }) => <StockTickerLink stockId={row.original.stockId} />,
        }),
        columnHelper.accessor("stockName", { header: "Ticker Name" }),
        columnHelper.accessor("assetClass", { header: "Asset Class" }),
        columnHelper.accessor("currency", { header: "Currency" }),
        columnHelper.accessor("maturityDate", {
          header: "Maturity Date",
          cell: ({ row }) =>
            row.original.maturityDate
              ? dayjs(row.original.maturityDate).format("YYYY-MM-DD")
              : "-",
        }),
        columnHelper.accessor("coupon", {
          header: "Coupon",
          meta: { isNumeric: true },
          cell: ({ row }) =>
            row.original.coupon ? row.original.coupon + "%" : "-",
        }),
        columnHelper.accessor("couponFreq", {
          header: "Coupon Freq",
          meta: { isNumeric: true },
          cell: ({ row }) =>
            row.original.couponFreq ? row.original.couponFreq : "-",
        }),
        columnHelper.accessor("faceValue", {
          header: "Face Value",
          meta: { isNumeric: true },
          cell: ({ row }) =>
            row.original.faceValue ? row.original.faceValue : "-",
        }),
        columnHelper.display({
          id: "actions",
          header: "Action",
          cell: ({ row }) => {
            const stock = row.original;
            return (
              <Grid container wrap="nowrap">
                <IconButton
                  size="small"
                  sx={sx_iconButton}
                  disabled={isFetching}
                  onClick={() => {
                    setIsDialogOpen(true);
                    setToEditData(stock);
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>

                <ConfirmationDialogWrapper
                  disabled={isFetching}
                  WrappingComponent={(props) => (
                    <IconButton
                      size="small"
                      aria-label="delete"
                      sx={sx_iconButton}
                      disabled={props.disabled}
                      onClick={props.onClick}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  )}
                  title="Confirmation"
                  description="Are you sure to delete this record ?"
                  onDialogConfirm={async () => {
                    await deleteMutation.mutateAsync({
                      stockId: stock.stockId,
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
    data: data ?? [],
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString" as const,
    getRowId: (row) => [row.stockId].join("|"),
    getColumnCanGlobalFilter: (column) =>
      [
        "stockId",
        "stockName",
        "assetClass",
        "currency",
        "maturityDate",
      ].includes(column.id),
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
  const emptyRowsCount = utils.getEmptyRowsCountForLastPage({
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
          <Grid size={{ xs: 12, sm: 'grow' }}>
            <Typography variant="h6" gutterBottom>
              Details {isError && <ImminentErrorIcon />}
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
                }}
              />
            </Grid>

            <Grid>
              <IconButton
                onClick={() => {
                  setToEditData(null);
                  setIsDialogOpen(true);
                }}
              >
                <AddIcon />
              </IconButton>
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
                        header.column.columnDef.meta?.isNumeric
                          ? { textAlign: "right" }
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
                  rowKeyPrefix="stocks-"
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
                            ? { textAlign: "right" }
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
      {isDialogOpen &&
        <EditFormStock
          onDialogClose={onDialogClose}
          content={toEditData}
        />}
    </>
  );
}
