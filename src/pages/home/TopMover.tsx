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
import repoStockPrice from '../../repo/repoStockPrice';
import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table';
import { IStockTopMovers } from '../../types/api';

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<typeof tableFeaturesConfig, IStockTopMovers['byUpPercentage'][number]>();

const sxTableBodyHidLtRow = {
    //https://v4.mui.com/styles/basics/#NestedStylesHook.js
    '& tr:last-child > td': {
        borderBottom: 0,
    }
};

export default function TopMover() {
    const { isLoading, isError, data, isFetching } = useQuery({
        ...repoStockPrice.GetTopMovers({ topCnt: 5 }),
        refetchInterval: 60000,
        refetchIntervalInBackground: true,
    });

    if (isError && data === undefined) {
        return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;
    }

    const columns = [
        columnHelper.display({ id: 'ticker', header: 'Rising (Percentage)' }),
        columnHelper.display({ id: 'change', header: 'Change' }),
    ];
    const risingTable = useTable({ features: tableFeaturesConfig, columns, data: data?.byUpPercentage ?? [] });
    const fallingTable = useTable({ features: tableFeaturesConfig, columns, data: data?.byDownPercentage ?? [] });

    return (
        <>
            {isFetching && <DefaultLinearProgress />}
            <Paper>
                <Grid container
                    sx={{
                        paddingTop: 2,
                        paddingLeft: 2,
                        paddingRight: 2,
                    }}>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6">
                            Top Moving Tickers {isError && <ImminentErrorIcon />}
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid size={{ xs: 12, xl: 6 }}>
                        <TableContainer >
                            <Table size="small">
                                <TableHead>
                                    {risingTable.getHeaderGroups().map(headerGroup => 
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => 
                                                <TableCell 
                                                    key={header.id} 
                                                    align={header.column.id === 'change' ? 'right' : undefined}>
                                                        {header.isPlaceholder ? null : <risingTable.FlexRender header={header} />}
                                                </TableCell>)}
                                        </TableRow>)}
                                </TableHead>

                                {isLoading &&
                                    <TableBody>
                                        {[...Array(3).keys()].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="body2" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                    <Typography variant="caption" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Typography variant="body1" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                    <Typography variant="caption" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                }

                                {!isLoading && data !== undefined &&
                                    <TableBody sx={sxTableBodyHidLtRow}>
                                        {risingTable.getRowModel().rows.map(row =>
                                            <TableRow hover key={row.id}>
                                                <TableCell scope="row">
                                                    <StockTickerLink stockId={row.original.stockId} />
                                                    <Typography variant="caption" component="p">{row.original.stockName}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={utils.getColorClass(row.original.priceChange)} align="right">
                                                        <Typography variant="body2" component="p">
                                                            {utils.getSignedDecimal(row.original.priceChangePercentage, 2)}%
                                                        </Typography>
                                                        <Typography variant="caption" component="p">
                                                            {row.original.price.toFixed(2)} ({utils.getSignedDecimal(row.original.priceChange, 2)})
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>)}
                                    </TableBody>
                                }

                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid size={{ xs: 12, xl: 6 }}>
                        <TableContainer >
                            <Table size="small" aria-label="top-mover-table">
                                <TableHead>
                                    {fallingTable.getHeaderGroups().map(headerGroup => 
                                        <TableRow key={headerGroup.id}>
                                            <TableCell>Failing (Percentage)</TableCell>
                                            <TableCell align="right">Change</TableCell>
                                        </TableRow>)}
                                </TableHead>

                                {isLoading &&

                                    <TableBody>
                                        {[...Array(3).keys()].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="body1" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                    <Typography variant="caption" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Typography variant="body1" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                    <Typography variant="caption" component="p">
                                                        <Skeleton />
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                }

                                {!isLoading && data !== undefined &&
                                    <TableBody sx={sxTableBodyHidLtRow}>
                                        {fallingTable.getRowModel().rows.map(row => 
                                            <TableRow hover key={row.id}>
                                                <TableCell scope="row">
                                                    <StockTickerLink stockId={row.original.stockId} />
                                                    <Typography variant="caption" component="p">{row.original.stockName}</Typography>
                                                </TableCell>
                                                <TableCell sx={utils.getColorClass(row.original.priceChange)} align="right">
                                                    <Typography variant="body2" component="p">
                                                        {utils.getSignedDecimal(row.original.priceChangePercentage, 2)}%
                                                    </Typography>
                                                    <Typography variant="caption" component="p">
                                                        {row.original.price.toFixed(2)} ({utils.getSignedDecimal(row.original.priceChange, 2)})
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>)}
                                    </TableBody>
                                }
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}