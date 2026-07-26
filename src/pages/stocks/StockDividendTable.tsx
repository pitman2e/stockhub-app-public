import { useMemo, useState } from 'react';
import utils from '../../utils/utils';
import dayjs from 'dayjs'
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Grid from '@mui/material/Grid';
import { DefaultErrorPlaceholder, DefaultPaper, DefaultLinearProgress } from '../../components/DefaultComponents';
import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MoveToInbox from '@mui/icons-material/MoveToInbox';
import { useDispatch } from 'react-redux'
import EditFormScripPrice from './EditFormScripPrice'
import {
    postErrorMessage,
    postSuccessMessage,
} from '../../redux/snackbarSlice';
import { IStockDividend } from '../../types/db';
import repoDividend from '../../repo/repoDividend';
import TableSkeletonCells from '../../components/TableSkeletonCells';
import {
    createColumnHelper,
    tableFeatures,
    useTable,
} from '@tanstack/react-table';

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<typeof tableFeaturesConfig, IStockDividend>();

const sx_tableCellNumeric = {
    textAlign: "right"
}

const sx_iconButton = {
    padding: 0,
    marginLeft: 0.5,
}

interface IStockDividendTableProps {
    portfolioId?: string | undefined;
    stockId?: string | undefined;
}

//Functional Component
export default function StockDividendTable({ portfolioId, stockId }: IStockDividendTableProps) {
    const [pageNo, setPageNo] = useState(0); //State Hook
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editScripDividendData, setEditScripDividendData] = useState<IStockDividend | null>(null);
    const now = dayjs();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    /* If key is not set, use the following block is OK as well
    useEffect(() => { //Effect Hook 
            populateData();
    }, [props.url]) //Dependency
    */

    const { isSuccess, isError, data, isFetching } = useQuery(
        repoDividend.Get({ portfolioId, stockId })
    );

    const onDialogClose = () => {
        queryClient.invalidateQueries({ queryKey: repoDividend.Get().invalidateQueryKey });
        setIsDialogOpen(false);
    }

    if (isError) return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;

    let emptyRowsCount = 0;
    let data2Show: IStockDividend[] = [];

    if (isSuccess) {
        data2Show = data.slice(pageNo * rowsPerPage, Math.min((pageNo + 1) * rowsPerPage, data.length));
        emptyRowsCount = data.length <= rowsPerPage ? 0 : ((pageNo + 1) * rowsPerPage) - Math.min((pageNo + 1) * rowsPerPage, data.length);
    }

    const columns = useMemo(() => columnHelper.columns([
        columnHelper.accessor('stockId', { header: 'ID' }),
        columnHelper.accessor('exDate', { header: 'Ex Date', cell: ({ row }) => <Grid container wrap="nowrap">{dayjs(row.original.exDate).format('YYYY-MM-DD')}{dayjs(row.original.exDate).isAfter(now) ? <HourglassEmptyIcon fontSize="small" /> : ''}</Grid> }),
        columnHelper.accessor('payableDate', { header: 'Pay Date', cell: ({ row }) => <Grid container wrap="nowrap">{dayjs(row.original.payableDate).format('YYYY-MM-DD')}{dayjs(row.original.payableDate).isAfter(now) ? <HourglassEmptyIcon fontSize="small" /> : ''}</Grid> }),
        columnHelper.accessor('dividendEvent', { header: 'Event' }),
        columnHelper.accessor('dividendType', { header: 'Type' }),
        columnHelper.accessor('amount', { header: 'Amt/Unit', cell: ({ row }) => row.original.amount === null ? '-' : <><Typography variant="caption">{row.original.currency + ' '}</Typography>{row.original.amount.toFixed(2)}</> }),
        columnHelper.accessor('amountAdjPercentage', { header: 'Adj', cell: ({ row }) => row.original.amountAdjPercentage !== null ? utils.getSignedDecimal(row.original.amountAdjPercentage, 2) + '%' : '-' }),
        columnHelper.accessor('scripPerCount', { header: 'Scrip Bonus', cell: ({ row }) => row.original.scripPerCount ? '1/' + row.original.scripPerCount : '-' }),
        columnHelper.accessor('scripPrice', { header: 'Scrip Price', cell: ({ row }) => <Grid container sx={{ textWrap: 'nowrap', justifyContent: 'flex-end' }}>{row.original.scripPrice === null ? '-' : row.original.scripPrice.toFixed(4)}{row.original.distributionType.indexOf('Scrip') >= 0 && row.original.distributionType.indexOf('Cash') >= 0 ? <IconButton aria-label="edit" sx={sx_iconButton} size="small" onClick={() => { setEditScripDividendData(row.original); setIsDialogOpen(true); }}><EditIcon fontSize="inherit" /></IconButton> : ''}</Grid> }),
    ]), [now]);
    const table = useTable({ features: tableFeaturesConfig, columns, data: isSuccess ? data : [] });
    const rows = table.getRowModel().rows;
    const rows2Show = rows.slice(pageNo * rowsPerPage, Math.min((pageNo + 1) * rowsPerPage, rows.length));
    const colCount = columns.length;

    return (
        <>
            {isFetching && <DefaultLinearProgress />}
            <DefaultPaper>

                <Grid container>
                    <Grid size="grow">
                        <Typography variant="h6" gutterBottom>
                            Ticker Dividends
                        </Typography>
                    </Grid>
                    {!!stockId && <Grid>
                        <IconButton onClick={async () => {
                            const response = await utils.requestWithToken('POST', repoDividend.RequestDL({ stockId: stockId }).url)
                            if (response.status === 200) {
                                dispatch(postSuccessMessage(""))
                                queryClient.invalidateQueries({ queryKey: repoDividend.Get().invalidateQueryKey });
                            } else {
                                const responseJson = await response.data;
                                dispatch(postErrorMessage(responseJson.message))
                            }
                        }}
                        >
                            <MoveToInbox />
                        </IconButton>
                    </Grid>}
                </Grid>

                <TableContainer>
                    <Table
                        size="small"
                        sx={{ minWidth: 650 }}
                    >
                            <TableHead>
                                {table.getHeaderGroups().map(headerGroup => <TableRow key={headerGroup.id}>{headerGroup.headers.map(header => <TableCell key={header.id} sx={header.column.id !== 'stockId' && header.column.id !== 'exDate' && header.column.id !== 'payableDate' && header.column.id !== 'dividendEvent' && header.column.id !== 'dividendType' ? sx_tableCellNumeric : undefined}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableCell>)}</TableRow>)}
                            </TableHead>
                        <TableBody>
                            {!isSuccess &&
                                <TableSkeletonCells rowsPerPage={rowsPerPage} colCount={colCount} rowKeyPrefix="stock-dividend-" />
                            }

                                {isSuccess && rows2Show.map(row => <TableRow hover key={row.id}>{row.getAllCells().map(cell => <TableCell key={cell.id} sx={cell.column.id !== 'stockId' && cell.column.id !== 'exDate' && cell.column.id !== 'payableDate' && cell.column.id !== 'dividendEvent' && cell.column.id !== 'dividendType' ? sx_tableCellNumeric : undefined}><table.FlexRender cell={cell} /></TableCell>)}</TableRow>)}
                            {emptyRowsCount > 0 && (
                                <TableRow sx={{ height: 33.0167 * emptyRowsCount }}>
                                    <TableCell colSpan={99} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
                <Dialog open={isDialogOpen} aria-labelledby="form-dialog-title">
                    <EditFormScripPrice onDialogClose={onDialogClose} data={editScripDividendData} />
                </Dialog>
            </DefaultPaper>
        </>
    )
}