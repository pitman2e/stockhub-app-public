import { useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import repoStocks from '../../repo/repoStocks';
import { DefaultErrorPlaceholder, DefaultPaper, DefaultLinearProgress } from '../../components/DefaultComponents';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import StockEditForm from './EditFormStock'
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs'
import StockTickerLink from '../../components/StockTickerLink';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch } from 'react-redux'
import ConfirmationDialogWrapper from '../../components/ConfirmationDialogWrapper';
import {
  postErrorMessage,
  postSuccessMessage,
} from '../../redux/snackbarSlice';
import { IStock } from '../../types/db';
import TableSkeletonCells from '../../components/TableSkeletonCells';
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';

const sx_iconButton = {
  padding: 0,
  marginLeft: 0.5,
}

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<typeof tableFeaturesConfig, IStock>();

interface IStocksTableProps {
  recordPerPage?: number | undefined,
  assetClasses: string[],
}

export default function StocksTable({ recordPerPage, assetClasses }: IStocksTableProps) {
  const [pageNo, setPageNo] = useState(0); //State Hook
  const [rowsPerPage, setRowsPerPage] = useState(recordPerPage === undefined ? 25 : recordPerPage);
  const pagePerRowOptions = [25, 50, 100, 250, 500];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toEditData, setToEditData] = useState<IStock | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  if (pagePerRowOptions.indexOf(rowsPerPage) === -1) {
    pagePerRowOptions.push(rowsPerPage);
    pagePerRowOptions.sort((a, b) => a - b) //By default javascript sort likes a string
  }

  const dataQuery = repoStocks.Get({ isOrderByPosVal: true, assetClasses: assetClasses.join(",") });

  const { isSuccess, isError, data, isFetching } = useQuery(dataQuery);

  const onDialogClose = () => {
    setIsDialogOpen(false);
  }

  if (isError) return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;

  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor("stockId", {
      header: "Ticker Id",
      cell: ({ row }) => <StockTickerLink stockId={row.original.stockId} />,
    }),
    columnHelper.accessor("stockName", { header: "Ticker Name" }),
    columnHelper.accessor("assetClass", { header: "Asset Class" }),
    columnHelper.accessor("currency", { header: "Currency" }),
    columnHelper.accessor("maturityDate", {
      header: "Maturity Date",
      cell: ({ row }) => row.original.maturityDate ? dayjs(row.original.maturityDate).format("YYYY-MM-DD") : "-",
    }),
    columnHelper.accessor("coupon", {
      header: "Coupon",
      cell: ({ row }) => row.original.coupon ? row.original.coupon + "%" : "-",
    }),
    columnHelper.accessor("couponFreq", {
      header: "Coupon Freq",
      cell: ({ row }) => row.original.couponFreq ? row.original.couponFreq : "-",
    }),
    columnHelper.accessor("faceValue", {
      header: "Face Value",
      cell: ({ row }) => row.original.faceValue ? row.original.faceValue : "-",
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
              aria-label="edit"
              sx={sx_iconButton}
              onClick={() => {
                setIsDialogOpen(true);
                setToEditData(stock);
              }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
            <ConfirmationDialogWrapper
              WrappingComponent={(props) => (
                <IconButton size="small" aria-label="delete" sx={sx_iconButton} {...props}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              )}
              title="Confirmation"
              description="Are you sure to delete this record ?"
              onDialogConfirm={async () => {
                const deleteQuery = repoStocks.Delete({ stockId: stock.stockId });
                const response = await deleteQuery.response;
                if (response.status === 200) {
                  dispatch(postSuccessMessage(""));
                } else {
                  const responseJson = await response.data;
                  dispatch(postErrorMessage(responseJson.message));
                }
                queryClient.invalidateQueries({ queryKey: deleteQuery.invalidateQueryKey });
              }}
            />
          </Grid>
        );
      },
    }),
  ]), [dispatch, queryClient]);

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: isSuccess ? data : [],
  });
  const rows = table.getRowModel().rows;
  const rows2Show = rows.slice(pageNo * rowsPerPage, Math.min((pageNo + 1) * rowsPerPage, rows.length));
  const emptyRowsCount = rows.length <= rowsPerPage ? 0 : ((pageNo + 1) * rowsPerPage) - Math.min((pageNo + 1) * rowsPerPage, rows.length);
  const colCount = columns.length;

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <DefaultPaper>
        <Grid container>
          <Grid size="grow">
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
          </Grid>
          <Grid>
            <IconButton onClick={() => {
              setToEditData(null);
              setIsDialogOpen(true);
            }}
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>

        <TableContainer>
          <Table
            size="small"
            sx={{ minWidth: 650 }}
          >
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {!isSuccess &&
              <TableSkeletonCells rowsPerPage={rowsPerPage} colCount={colCount} rowKeyPrefix="stocks-" />
              }

              {isSuccess && rows2Show.map(row => (
                  <TableRow hover key={row.id}>
                    {row.getAllCells().map(cell => (
                      <TableCell key={cell.id}>
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
      </DefaultPaper >
      <Dialog open={isDialogOpen} aria-labelledby="form-dialog-title">
        <StockEditForm onDialogClose={onDialogClose} dialogUpdateContent={toEditData} />
      </Dialog>
    </>
  );
}
