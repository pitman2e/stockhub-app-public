import { useMemo, useState } from "react";
import dayjs from "dayjs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import MarketSelect from "../../components/MarketSelect"; // Ensure to import the updated MarketSelect
import TransactionTypeSelect from "../../components/TransactionTypeSelect";
import { Box, Stack } from "@mui/system";
import StockIdAutocomplete from "../../components/StockIdAutocomplete";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  createColumnHelper,
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

interface StockTransactionTableProps {
  portfolioId: string | undefined;
}

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  ITransactionGetDto
>();

export default function StockTransactionTable({
  portfolioId,
}: StockTransactionTableProps) {
  const now = dayjs();
  const [dateRange, setDateRange] = useState<{
    fmDate: number | null;
    toDate: number | null;
  }>({ fmDate: null, toDate: null });
  const [market, setMarket] = useState<string>("");
  const [txType, setTxType] = useState<string>("");
  const [stockId, setStockId] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    pageNo: 0,
    rowsPerPage: 25,
    pagePerRowOptions: [25, 50, 100, 250, 500],
    prefetchedPagesCount: 5,
  });
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    content: ITransactionGetDto | null;
  }>({ isOpen: false, content: null });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const queryFilterDict = {
    portfolioId: portfolioId,
    stockId: stockId,
    transactionType: txType,
    market: market,
    fmDate: dateRange.fmDate,
    toDate: dateRange.toDate,
    limit: pageInfo.rowsPerPage * pageInfo.prefetchedPagesCount,
    offset:
      Math.floor(pageInfo.pageNo / pageInfo.prefetchedPagesCount) *
      pageInfo.prefetchedPagesCount *
      pageInfo.rowsPerPage,
  };

  const { isSuccess, isError, data, isFetching } = useQuery(
    repoStockTransaction.Get(queryFilterDict),
  );
  useQuery(
    repoStockTransaction.Get({
      ...queryFilterDict,
      offset: queryFilterDict.offset + queryFilterDict.limit,
    }),
  ); // Precache the next query

  const { data: portfolioData } = useQuery(repoPortfolio.Get());

  //TODO: Avoid hardcode, should have version and use that version to invalidate queries instead
  if (data !== null && data !== undefined && !("totalCount" in data)) {
    queryClient.invalidateQueries({
      queryKey: repoStockTransaction.Get().invalidateQueryKey,
    });
  }

  if (pageInfo.pagePerRowOptions.indexOf(pageInfo.rowsPerPage) === -1) {
    pageInfo.pagePerRowOptions.push(pageInfo.rowsPerPage);
    pageInfo.pagePerRowOptions.sort((a, b) => a - b); //By default javascript sort likes a string
  }

  if (isError)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  let emptyRowsCount = 0;
  let data2Show: ITransactionGetDto[] = [];

  if (isSuccess) {
    data2Show = data.tableData.slice(
      (pageInfo.pageNo % pageInfo.prefetchedPagesCount) * pageInfo.rowsPerPage,
      Math.min(
        ((pageInfo.pageNo % pageInfo.prefetchedPagesCount) + 1) *
          pageInfo.rowsPerPage,
        data.tableData.length,
      ),
    );
    emptyRowsCount =
      data.tableData.length <= pageInfo.rowsPerPage
        ? 0
        : pageInfo.rowsPerPage - data2Show.length;
  }

  let colCount = 12;
  const portfolios =
    portfolioData === undefined
      ? []
      : portfolioData.filter((p) => p.portfolioId === portfolioId);
  const isRealPortfolio = portfolios.length === 1 && !portfolios[0].isVirtual;
  if (isRealPortfolio) {
    colCount -= 1;
  }

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({ id: "date", header: "Date" }),
        columnHelper.display({ id: "stockId", header: "ID" }),
        columnHelper.display({ id: "stockName", header: "Name" }),
        ...(!isRealPortfolio
          ? [columnHelper.display({ id: "portfolioId", header: "Portfolio" })]
          : []),
        columnHelper.display({ id: "tranType", header: "Type" }),
        columnHelper.display({ id: "handlingFee", header: "Fee" }),
        columnHelper.display({ id: "tax", header: "Tax" }),
        columnHelper.display({ id: "accruedInterest", header: "Acur.Int" }),
        columnHelper.display({ id: "unitAmt", header: "Unit Amt" }),
        columnHelper.display({ id: "txCount", header: "Count" }),
        columnHelper.display({ id: "amount", header: "Amt * Cnt" }),
        columnHelper.display({ id: "actions", header: "Action" }),
      ]),
    [isRealPortfolio],
  );
  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: isSuccess ? data.tableData : [],
  });
  const rows = table.getRowModel().rows;
  const rows2Show = rows.slice(
    (pageInfo.pageNo % pageInfo.prefetchedPagesCount) * pageInfo.rowsPerPage,
    Math.min(
      ((pageInfo.pageNo % pageInfo.prefetchedPagesCount) + 1) *
        pageInfo.rowsPerPage,
      rows.length,
    ),
  );

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
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size="grow">
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
            </Grid>

            {isRealPortfolio && (
              <Grid size={{ xs: 12, md: "auto" }}>
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

          <TableContainer>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        sx={
                          header.column.id !== "date" &&
                          header.column.id !== "stockId" &&
                          header.column.id !== "stockName" &&
                          header.column.id !== "portfolioId" &&
                          header.column.id !== "tranType" &&
                          header.column.id !== "actions"
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
                    rowsPerPage={pageInfo.rowsPerPage}
                    colCount={colCount}
                  />
                )}

                {isSuccess &&
                  rows2Show.map((row) => {
                    const d = row.original;
                    return (
                      <TableRow hover key={row.id}>
                        <TableCell>
                          <Grid
                            container
                            wrap="nowrap"
                            sx={{ alignItems: "center" }}
                          >
                            {dayjs(d.txDate).format("YYYY-MM-DD")}
                            {dayjs(d.txDate).isAfter(now) ? (
                              <HourglassEmptyIcon fontSize="small" />
                            ) : (
                              ""
                            )}
                          </Grid>
                        </TableCell>
                        <TableCell>{d.stockId}</TableCell>
                        <TableCell>{d.stockName}</TableCell>
                        {!isRealPortfolio && (
                          <TableCell>{d.portfolioId}</TableCell>
                        )}
                        <TableCell>{d.tranType}</TableCell>

                        <TableCell sx={sx_tableCellNumeric}>
                          <Typography variant="caption">
                            {d.handlingFee ? d.currency + " " : ""}
                          </Typography>
                          {d.handlingFee ? d.handlingFee.toFixed(2) : "-"}
                        </TableCell>

                        <TableCell sx={sx_tableCellNumeric}>
                          <Typography variant="caption">
                            {d.tax ? d.currency + " " : ""}
                          </Typography>
                          {d.tax ? d.tax.toFixed(2) : "-"}
                        </TableCell>

                        <TableCell sx={sx_tableCellNumeric}>
                          <Typography variant="caption">
                            {d.accruedInterest ? d.currency + " " : ""}
                          </Typography>
                          {d.accruedInterest
                            ? d.accruedInterest.toFixed(2)
                            : "-"}
                        </TableCell>

                        <TableCell sx={sx_tableCellNumeric}>
                          <Typography variant="caption">
                            {d.currency + " "}
                          </Typography>
                          {d.unitAmt.toFixed(2)}
                        </TableCell>

                        <TableCell sx={sx_tableCellNumeric}>
                          {d.txCount}
                        </TableCell>

                        <TableCell sx={sx_tableCellNumeric}>
                          <Typography variant="caption">
                            {d.currency + " "}
                          </Typography>
                          {(d.unitAmt * d.txCount).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <Grid
                            container
                            wrap="nowrap"
                            sx={{ alignItems: "center" }}
                          >
                            <IconButton
                              size="small"
                              aria-label="edit"
                              sx={sx_iconButton}
                              onClick={() => {
                                setDialogState({ isOpen: true, content: d });
                              }}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>

                            <ConfirmationDialogWrapper
                              WrappingComponent={(props) => {
                                return (
                                  <IconButton
                                    size="small"
                                    aria-label="delete"
                                    sx={sx_iconButton}
                                    {...props}
                                  >
                                    <DeleteIcon fontSize="inherit" />
                                  </IconButton>
                                );
                              }}
                              title="Confirmation"
                              description="Are you sure to delete this record ?"
                              onDialogConfirm={async () => {
                                const deleteQuery = repoStockTransaction.Delete(
                                  { portfolioId: d.portfolioId, iden: d.iden },
                                );
                                const response = await deleteQuery.response;
                                if (response.status === 200) {
                                  dispatch(postSuccessMessage(""));
                                } else {
                                  const responseJson = await response.data;
                                  dispatch(
                                    postErrorMessage(responseJson.message),
                                  );
                                }

                                deleteQuery.invalidateQueryKeys.forEach(
                                  (queryKey) => {
                                    queryClient.invalidateQueries({ queryKey });
                                  },
                                );
                              }}
                              onDialogCancel={null}
                            />

                            {d.comment && (
                              <Tooltip
                                title={d.comment}
                                aria-label="view-comment"
                              >
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
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {emptyRowsCount > 0 && (
                  <TableRow sx={{ height: 33.0167 * emptyRowsCount }}>
                    <TableCell colSpan={colCount} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={pageInfo.pagePerRowOptions}
            component="div"
            count={data?.totalCount ?? 0}
            rowsPerPage={pageInfo.rowsPerPage}
            page={pageInfo.pageNo}
            onPageChange={(_event, newpage) =>
              setPageInfo((prev) => ({ ...prev, pageNo: newpage }))
            }
            onRowsPerPageChange={(event) => {
              setPageInfo((prev) => ({
                ...prev,
                pageNo: 0,
                rowsPerPage: parseInt(event.target.value, 10),
              }));
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
