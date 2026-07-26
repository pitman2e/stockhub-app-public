import { useMemo, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import {
  DefaultErrorPlaceholder,
  DefaultPaper,
  DefaultLinearProgress,
} from "../../components/DefaultComponents";
import { Grid } from "@mui/material";
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
  columnFilteringFeature,
  createFilteredRowModel,
  createColumnHelper,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

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
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  IStockSummary
>();
const numericColumnIds = new Set([
  "totalCost",
  "totalUnrealisedAmount",
  "totalRealisedAmount",
  "totalDividend",
  "totalRealisedGain",
  "totalUnrealisedGain",
  "curTxGainAmount",
]);

interface IPortfoliosDetailsTableProps {
  recordPerPage?: number | undefined;
}

export default function PortfoliosDetailsTable({
  recordPerPage,
}: IPortfoliosDetailsTableProps) {
  const [posStatus, setPosStatus] = useState(POS_STATUS_OPEN);
  const [pageNo, setPageNo] = useState(0); //State Hook
  const [rowsPerPage, setRowsPerPage] = useState(
    recordPerPage === undefined ? 25 : recordPerPage,
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const pagePerRowOptions = [25, 50, 100, 250, 500];
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    content: IStockSummary | null;
  }>({ isOpen: false, content: null });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  if (pagePerRowOptions.indexOf(rowsPerPage) === -1) {
    pagePerRowOptions.push(rowsPerPage);
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
                <IconButton
                  size="small"
                  aria-label="edit"
                  sx={sx_iconButton}
                  onClick={() => setDialogState({ isOpen: true, content: d })}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
                <ConfirmationDialogWrapper
                  WrappingComponent={(props) => (
                    <IconButton
                      size="small"
                      aria-label="delete"
                      sx={sx_iconButton}
                      {...props}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  )}
                  title="Confirmation"
                  description="Are you sure to delete this record ?"
                  onDialogConfirm={async () => {
                    const deleteQuery = repoPortfolio.Delete({
                      portfolioId: d.portfolioId,
                    });
                    const response = await deleteQuery.response;
                    if (response.status === 200) {
                      dispatch(postSuccessMessage(""));
                    } else {
                      const responseJson = await response.data;
                      dispatch(postErrorMessage(responseJson.message));
                    }
                    queryClient.invalidateQueries({
                      queryKey: deleteQuery.invalidateQueryKey,
                    });
                  }}
                />
              </Grid>
            );
          },
        }),
      ]),
    [dispatch, queryClient],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: predata,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => column.id === "portfolioName",
  });
  const filteredRows = table.getRowModel().rows;
  const rows2Show = filteredRows.slice(
    pageNo * rowsPerPage,
    Math.min((pageNo + 1) * rowsPerPage, filteredRows.length),
  );
  emptyRowsCount =
    filteredRows.length <= rowsPerPage
      ? 0
      : (pageNo + 1) * rowsPerPage -
        Math.min((pageNo + 1) * rowsPerPage, filteredRows.length);
  const colCount = columns.length;

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

          <Grid>
            <IconButton
              onClick={() => {
                setDialogState({ isOpen: true, content: null });
              }}
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container>
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <Button
              disabled={posStatus === POS_STATUS_OPEN}
              onClick={() => {
                setPosStatus(POS_STATUS_OPEN);
                setPageNo(0);
              }}
            >
              Open
            </Button>
            <Button
              disabled={posStatus === POS_STATUS_CLOSED}
              onClick={() => {
                setPosStatus(POS_STATUS_CLOSED);
                setPageNo(0);
              }}
            >
              Closed
            </Button>
            <Button
              disabled={posStatus === POST_STATUS_VIRTUAL}
              onClick={() => {
                setPosStatus(POST_STATUS_VIRTUAL);
                setPageNo(0);
              }}
            >
              Virtual
            </Button>
          </ButtonGroup>
          <TextField
            size="small"
            label="Search..."
            value={globalFilter}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
              setPageNo(0);
            }}
            sx={{ marginLeft: 1 }}
          />
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
                        numericColumnIds.has(header.column.id)
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
                  rowKeyPrefix="portfolio-details-"
                />
              )}

              {isSuccess &&
                rows2Show.map((row) => (
                  <TableRow hover key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        sx={{
                          ...(numericColumnIds.has(cell.column.id)
                            ? sx_tableCellNumeric
                            : {}),
                          ...(cell.column.id === "totalRealisedGain"
                            ? utils.getColorClass(
                                row.original.totalRealisedGain,
                              )
                            : {}),
                          ...(cell.column.id === "totalUnrealisedGain"
                            ? utils.getColorClass(
                                row.original.totalUnrealisedGain,
                              )
                            : {}),
                          ...(cell.column.id === "curTxGainAmount"
                            ? utils.getColorClass(row.original.curTxGainAmount)
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
                  <TableCell colSpan={99} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={pagePerRowOptions}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={pageNo}
          onPageChange={(_event, newpage) => setPageNo(newpage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPageNo(0);
          }}
        />
      </DefaultPaper>
      <Dialog open={dialogState.isOpen} aria-labelledby="form-dialog-title">
        <EditFormPortfolio
          onDialogClose={() => setDialogState({ isOpen: false, content: null })}
          data={dialogState.content}
        />
      </Dialog>
    </>
  );
}
