import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import utils from '../../utils/utils';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { DefaultErrorPlaceholder, DefaultLinearProgress, DefaultPaper } from '../../components/DefaultComponents';
import ImminentErrorIcon from '../../components/ImminentErrorIcon';
import StockTickerLink from '../../components/StockTickerLink';
import WatchlistChart from './WatchlistChart';
import { ErrorBoundary } from "react-error-boundary";
import repoWatchlist from '../../repo/repoWatchlist';
import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table';
import { IStockMovements } from '../../types/api';

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<typeof tableFeaturesConfig, IStockMovements['watchlists'][number]>();

const sxTableBodyHidLtRow = {
    //https://v4.mui.com/styles/basics/#NestedStylesHook.js
    '& tr:last-child > td': {
        borderBottom: 0,
    }
};

const sxSkeletonFlexReverse = {
    display: 'flex',
    flexDirection: 'row-reverse',
}

export default function Watchlist() {
    const { isLoading, isError, data, isFetching } = useQuery(
        {
            ...repoWatchlist.Get({ topCnt: 6 }),
            refetchInterval: 60000,
            refetchIntervalInBackground: true,
        });

    if (isError && data === undefined) {
        return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;
    }

    const columns = [
        columnHelper.display({ id: 'stock', header: 'Stock' }),
        columnHelper.display({ id: 'chart', header: '' }),
        columnHelper.display({ id: 'change', header: 'Change' }),
    ];
    const table = useTable({ features: tableFeaturesConfig, columns, data: data?.watchlists ?? [] });

    return (
        <>
            {isFetching && <DefaultLinearProgress />}
            <Paper>
                <Grid
                    container sx={{
                        paddingTop: 2,
                        paddingLeft: 2,
                        paddingRight: 2,
                    }}>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">
                            Watchlist {isError && <ImminentErrorIcon />}
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container>
                    <TableContainer >
                        <Table size="small" aria-label="watchlist-table">
                            <TableHead>
                                {table.getHeaderGroups().map(headerGroup => 
                                    <TableRow key={headerGroup.id}>{headerGroup.headers.map(header => 
                                        <TableCell key={header.id} align={header.column.id === 'change' ? 'right' : undefined}>
                                            {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                                        </TableCell>)}
                                    </TableRow>)}
                            </TableHead>
                            <TableBody sx={sxTableBodyHidLtRow}>
                                {isLoading &&
                                    [...Array(3).keys()].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell scope="row">
                                                <Typography variant="body2" component="p">
                                                    <Skeleton width="30%" />
                                                </Typography>
                                                <Typography variant="caption" component="p" >
                                                    <Skeleton width="60%" />
                                                </Typography>
                                            </TableCell>

                                            <TableCell scope="row">
                                            </TableCell>

                                            <TableCell align="right" >
                                                <Typography variant="body1" component="p" sx={sxSkeletonFlexReverse}>
                                                    <Skeleton sx={{ width: "3em", align: "right" }} />
                                                </Typography>
                                                <Typography variant="caption" component="p" sx={sxSkeletonFlexReverse}>
                                                    <Skeleton sx={{ width: "7em", align: "right" }} />
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                {!isLoading && data !== undefined &&
                                    table.getRowModel().rows.map((tableRow) => {
                                        const row = tableRow.original; return (
                                            <TableRow hover key={tableRow.id}>
                                                <TableCell sx={{ width: '100%' }} scope="row">
                                                    <StockTickerLink stockId={row.stockId} />
                                                    <Typography sx={{ display: { xs: 'none', md: 'block' } }} variant="caption" component="p">
                                                        {row.stockName}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell scope="row">
                                                    <ErrorBoundary fallback={<></>}>
                                                        <WatchlistChart stockId={row.stockId}></WatchlistChart>
                                                    </ErrorBoundary>
                                                </TableCell>

                                                <TableCell sx={{ ...utils.getColorClass(row.priceChange), width: '0.1%' }} align="right">
                                                    <Typography variant="body1" component="p">
                                                        {utils.getSignedDecimal(row.priceChangePercentage, 2)}%
                                                    </Typography>
                                                    <Typography variant="caption" component="p">
                                                        {row.price.toFixed(2)} ({utils.getSignedDecimal(row.priceChange, 2)})
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Paper >
        </>
    );
}