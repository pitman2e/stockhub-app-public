import { useMemo, useState } from "react";
import dayjs from "dayjs";
import utils from "../../utils/utils";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
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
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

interface IRealisedDividendTableProps {
  portfolioId: string | undefined;
  filterStockId: string;
  filterMarket?: string;
  isShowPortfolioId: boolean;
}

const sx_tableCellNumeric = {
  textAlign: "right",
};

const sx_iconButton = {
  padding: 0,
  marginLeft: 0.5,
};

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  RealisedDividend
>();

export default function RealisedDividendTable({
  portfolioId,
  filterStockId,
  filterMarket,
  isShowPortfolioId,
}: IRealisedDividendTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [pageNo, setPageNo] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStateTran, setDialogStateTran] = useState<{
    isOpen: boolean;
    content: ITransactionGetDto | null;
  }>({ isOpen: false, content: null });
  const [editScripDividendData, setEditScripDividendData] =
    useState<IRealisedScripPutDto | null>(null);
  const now = dayjs();
  const realisedQuery = repoRealisedDividend.Get({
    portfolioId: portfolioId,
    stockId: filterStockId,
    market: filterMarket,
  });

  const { isError, data, isFetching } = useQuery(realisedQuery);

  const onDialogClose = () => {
    setIsDialogOpen(false);
  };

  if (isError)
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );

  const emptyRowsCount =
    data === undefined
      ? 0
      : data.length <= rowsPerPage
        ? 0
        : (pageNo + 1) * rowsPerPage -
          Math.min((pageNo + 1) * rowsPerPage, data.length);
  const data2Show =
    data === undefined
      ? undefined
      : data.slice(
          pageNo * rowsPerPage,
          Math.min((pageNo + 1) * rowsPerPage, data.length),
        );
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({ id: "stockId", header: "ID" }),
        columnHelper.display({ id: "stockName", header: "Name" }),
        ...(isShowPortfolioId
          ? [columnHelper.display({ id: "portfolioId", header: "Portfolio" })]
          : []),
        columnHelper.display({ id: "exDate", header: "Ex Date" }),
        columnHelper.display({ id: "payDate", header: "Pay Date" }),
        columnHelper.display({ id: "dividendType", header: "Ty" }),
        columnHelper.display({ id: "cnt", header: "Payable Unit" }),
        columnHelper.display({ id: "payPerUnit", header: "Amt/Unit" }),
        columnHelper.display({ id: "dividendYield", header: "Yd" }),
        columnHelper.display({ id: "amountAdjPercentage", header: "Adj" }),
        columnHelper.display({ id: "scripReceived", header: "Scrip Re'd" }),
        columnHelper.display({ id: "reinvestPrice", header: "Reinv Price" }),
        columnHelper.display({ id: "totalAmt", header: "Total Amt" }),
        columnHelper.display({ id: "actions", header: "Action" }),
      ]),
    [isShowPortfolioId],
  );
  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: data ?? [],
  });
  const rows = table.getRowModel().rows;
  const rows2Show = rows.slice(
    pageNo * rowsPerPage,
    Math.min((pageNo + 1) * rowsPerPage, rows.length),
  );

  let colCount = 13;
  if (isShowPortfolioId) {
    colCount += 1;
  }

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
          <Typography id="tabelLabel" variant="h6">
            Realised Dividends
          </Typography>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        sx={
                          ![
                            "stockId",
                            "stockName",
                            "portfolioId",
                            "exDate",
                            "payDate",
                            "dividendType",
                            "actions",
                          ].includes(header.column.id)
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
                {!data2Show && (
                  <TableSkeletonCells
                    rowsPerPage={rowsPerPage}
                    colCount={colCount}
                    rowKeyPrefix="realised-dividend-"
                  />
                )}

                {rows2Show.map((row) => {
                  const d = row.original;
                  return (
                    <TableRow hover key={row.id}>
                      <TableCell>
                        <StockTickerLink stockId={d.stockId} />
                      </TableCell>
                      <TableCell>{d.stockName}</TableCell>
                      {isShowPortfolioId && (
                        <TableCell>{d.portfolioId}</TableCell>
                      )}
                      <TableCell>
                        <Grid
                          container
                          wrap="nowrap"
                          sx={{ alignItems: "center" }}
                        >
                          {dayjs(d.exDate).format("YYYY-MM-DD")}
                          {dayjs(d.exDate).isAfter(now) ? (
                            <HourglassEmptyIcon fontSize="small" />
                          ) : (
                            ""
                          )}
                        </Grid>
                      </TableCell>
                      <TableCell>
                        <Grid
                          container
                          wrap="nowrap"
                          sx={{ alignItems: "center" }}
                        >
                          {dayjs(d.payDate).format("YYYY-MM-DD")}
                          {dayjs(d.payDate).isAfter(now) ? (
                            <HourglassEmptyIcon fontSize="small" />
                          ) : (
                            ""
                          )}
                        </Grid>
                      </TableCell>
                      <TableCell>{d.dividendType}</TableCell>
                      <TableCell sx={sx_tableCellNumeric}>
                        {d.cnt.toFixed(2)}
                      </TableCell>
                      <TableCell sx={sx_tableCellNumeric}>
                        <Typography variant="caption">
                          {d.currency + " "}
                        </Typography>
                        {d.payPerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell sx={sx_tableCellNumeric}>
                        {utils.getFmtDec(d.dividendYield, 2, "", "%", "-")}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...sx_tableCellNumeric,
                          ...utils.getColorClass(d.amountAdjPercentage),
                        }}
                      >
                        {d.amountAdjPercentage !== null
                          ? utils.getSignedDecimal(d.amountAdjPercentage, 2) +
                            "%"
                          : "-"}
                      </TableCell>

                      <TableCell sx={sx_tableCellNumeric}>
                        <Grid
                          container
                          wrap="nowrap"
                          sx={{
                            alignItems: "center",
                            justifyContent: "flex-end",
                          }}
                        >
                          {d.distributionType.indexOf("Scrip") >= 0
                            ? d.scripReceived
                            : "-"}
                          {d.distributionType.indexOf("Scrip") >= 0 &&
                          d.distributionType.indexOf("Cash") >= 0 ? (
                            <IconButton
                              aria-label="edit"
                              sx={sx_iconButton}
                              size="small"
                              onClick={() => {
                                setEditScripDividendData(d);
                                setIsDialogOpen(true);
                              }}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                          ) : (
                            ""
                          )}
                        </Grid>
                      </TableCell>

                      <TableCell sx={sx_tableCellNumeric}>
                        {d.reinvestPrice ? d.reinvestPrice.toFixed(4) : "-"}
                      </TableCell>

                      <TableCell>
                        <Grid
                          container
                          wrap="nowrap"
                          sx={{
                            alignItems: "center",
                            justifyContent: "flex-end",
                          }}
                        >
                          {d.isMissingScripPrice ? (
                            <Tooltip title="Missing Scrip Price">
                              <ErrorIcon sx={sx_iconButton} fontSize="small" />
                            </Tooltip>
                          ) : (
                            <>
                              <Typography variant="caption">
                                {d.currency}&nbsp;
                              </Typography>
                              <Typography variant="inherit">
                                {d.totalAmt.toFixed(2)}
                              </Typography>
                            </>
                          )}
                        </Grid>
                      </TableCell>
                      <TableCell>
                        <Grid container wrap="nowrap">
                          <IconButton
                            size="small"
                            aria-label="copy"
                            sx={sx_iconButton}
                            onClick={() => {
                              const unitAmt = d.scripReceived
                                ? (d.reinvestPrice ??
                                  utils.round2Dec(
                                    d.totalAmt / d.scripReceived,
                                    4,
                                  ))
                                : d.payPerUnit;
                              const txCount = d.scripReceived
                                ? d.scripReceived
                                : d.cnt;

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
                                    ? -utils.round2Dec(
                                        unitAmt * txCount * 0.3,
                                        4,
                                      )
                                    : null, //TODO: Do not hardcode tax rate
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
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            count={data == undefined ? 0 : data.length}
            rowsPerPage={rowsPerPage}
            page={pageNo}
            onPageChange={(_event, newpage) => setPageNo(newpage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPageNo(0);
            }}
          />
          <Dialog open={isDialogOpen} aria-labelledby="form-dialog-title">
            {editScripDividendData !== null && (
              <EditFormDividend
                onDialogClose={onDialogClose}
                data={editScripDividendData}
              ></EditFormDividend>
            )}
          </Dialog>
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
