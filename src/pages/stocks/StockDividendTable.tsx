import { useMemo, useState } from "react";
import utils from "../../utils/utils";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Grid from "@mui/material/Grid";
import {
  DefaultErrorPlaceholder,
  DefaultPaper,
  DefaultLinearProgress,
} from "../../components/DefaultComponents";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MoveToInbox from "@mui/icons-material/MoveToInbox";
import { useDispatch } from "react-redux";
import EditFormScripPrice from "./EditFormScripPrice";
import {
  postErrorMessage,
  postSuccessMessage,
} from "../../redux/snackbarSlice";
import { IStockDividend } from "../../types/db";
import repoDividend from "../../repo/repoDividend";
import TableSkeletonCells from "../../components/TableSkeletonCells";
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { AxiosError } from "axios";
import ImminentErrorIcon from "../../components/ImminentErrorIcon";

const tableFeaturesConfig = tableFeatures({
  rowPaginationFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  IStockDividend
>();

const sx_tableCellNumeric = {
  textAlign: "right",
};

const sx_iconButton = {
  padding: 0,
  marginLeft: 0.5,
};

interface IStockDividendTableProps {
  portfolioId?: string;
  stockId?: string;
}

//Functional Component
export default function StockDividendTable({
  portfolioId,
  stockId,
}: IStockDividendTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editScripDividendData, setEditScripDividendData] = useState<IStockDividend | null>(null);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  /* If key is not set, use the following block is OK as well
    useEffect(() => { //Effect Hook 
            populateData();
    }, [props.url]) //Dependency
    */

  const { isSuccess, isError, data, isFetching } = useQuery(
    repoDividend.Get({ portfolioId, stockId }),
  );

  const onDialogClose = () => {
    queryClient.invalidateQueries({
      queryKey: repoDividend.Get().invalidateQueryKey,
    });
    setIsDialogOpen(false);
  };

  const requestDlMutation = useMutation({
    mutationFn: async (id: string) => {
      const request = repoDividend.RequestDL({ stockId: id });
      return {
        response: await request.requestFn(),
        invalidateQueryKey: request.invalidateQueryKey,
      };
    },
    onSuccess: ({ response, invalidateQueryKey }) => {
      dispatch(postSuccessMessage(""));
      queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (error: AxiosError<any>) => {
      dispatch(postErrorMessage(utils.getApiErrorMessage(error)));
    },
  });

  if (isError && !data)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  let emptyRowsCount = 0;

  const columns = useMemo(
    () => {
      const now = dayjs();
      return columnHelper.columns([
        columnHelper.accessor("stockId", {
          header: "ID",
        }),
        columnHelper.accessor("exDate", {
          header: "Ex Date",
          cell: ({ row }) => (
            <Grid container wrap="nowrap">
              {dayjs(row.original.exDate).format("YYYY-MM-DD")}
              {dayjs(row.original.exDate).isAfter(now) ? (
                <HourglassEmptyIcon fontSize="small" />
              ) : null}
            </Grid>
          ),
        }),
        columnHelper.accessor("payableDate", {
          header: "Pay Date",
          cell: ({ row }) => (
            <Grid container wrap="nowrap">
              {dayjs(row.original.payableDate).format("YYYY-MM-DD")}
              {dayjs(row.original.payableDate).isAfter(now) ? (
                <HourglassEmptyIcon fontSize="small" />
              ) : null}
            </Grid>
          ),
        }),
        columnHelper.accessor("dividendEvent", {
          header: "Event",
        }),
        columnHelper.accessor("dividendType", {
          header: "Type",
        }),
        columnHelper.accessor("amount", {
          header: "Amt/Unit",
          meta: { isNumeric: true },
          cell: ({ row }) =>
            row.original.amount === null ? (
              "-"
            ) : (
              <>
                <Typography variant="caption">
                  {`${row.original.currency} `}
                </Typography>
                {row.original.amount.toFixed(2)}
              </>
            ),
        }),
        columnHelper.accessor("amountAdjPercentage", {
          header: "Adj",
          meta: { isNumeric: true, isGainLoss: true },
          cell: ({ row }) =>
            row.original.amountAdjPercentage !== null
              ? `${utils.getSignedDecimal(row.original.amountAdjPercentage, 2)}%`
              : "-",
        }),
        columnHelper.accessor("scripPerCount", {
          header: "Scrip Bonus",
          meta: { isNumeric: true },
          cell: ({ row }) =>
            row.original.scripPerCount
              ? `1/${row.original.scripPerCount}`
              : "-",
        }),
        columnHelper.accessor("scripPrice", {
          header: "Scrip Price",
          meta: { isNumeric: true },
          cell: ({ row }) => (
            <Grid
              container
              sx={{ textWrap: "nowrap", justifyContent: "flex-end" }}
            >
              {row.original.scripPrice === null
                ? "-"
                : row.original.scripPrice.toFixed(4)}
              {row.original.distributionType?.includes("Scrip") &&
                row.original.distributionType?.includes("Cash") ? (
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
          ),
        }),
      ])
    },
    [],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: data ?? [],
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (row) => [row.stockId].join("|"),
    autoResetPageIndex: true,
  });

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
        <Grid container>
          <Grid size="grow">
            <Typography variant="h6" gutterBottom>
              Ticker Dividends {isError && <ImminentErrorIcon />}
            </Typography>
          </Grid>
          {!!stockId && (
            <Grid>
              <IconButton
                onClick={() => {
                  if (stockId) {
                    requestDlMutation.mutate(stockId);
                  }
                }}
                disabled={requestDlMutation.isPending}
              >
                <MoveToInbox />
              </IconButton>
            </Grid>
          )}
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
                  rowKeyPrefix="stock-dividend-"
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
        {isDialogOpen &&
          <EditFormScripPrice
            onDialogClose={onDialogClose}
            data={editScripDividendData}
          />}
      </DefaultPaper>
    </>
  );
}
