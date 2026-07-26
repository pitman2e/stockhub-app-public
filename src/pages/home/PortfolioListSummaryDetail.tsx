import dayjs from 'dayjs'
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import utils from '../../utils/utils';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import GridDetailItem from './GridDetailItem'
import { Box } from '@mui/system';
import { IStockSummary } from "../../types/api";

interface IPortfolioListSummaryDetailProps {
    data: IStockSummary[];
    isLatest: boolean;
}

//TODO: Should not hardcodde string at : to={`/portfolio-overview/${d.portfolioId === "Summary" ? "" : d.portfolioId }`}
export default function PortfolioListSummaryDetail({ data, isLatest }: IPortfolioListSummaryDetailProps) {
    return (
        data.map((d) => (
            <Grid container sx={{ flexDirection: "column" }} key={d.portfolioId} size={{ xs: 12 }} >
                <Grid container>
                    <Grid size="grow">
                        <Link
                            component={RouterLink}
                            color="inherit" underline="hover" variant="body1"
                            to={`/portfolio-overview/${d.portfolioId === "Summary" ? "" : d.portfolioId}`}
                        >
                            {d.portfolioName}
                        </Link>

                        <Typography component="p" variant="caption">
                            {d.marketDate && dayjs(d.marketDate).format("YYYY-MM-DD")}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 3, sm: 2 }} sx={{ textAlign: 'right' }}>
                        <Typography component="p" variant="body1">
                            {d.totalUnrealisedAmount.toFixed(2)}
                        </Typography>

                        <Typography component="p" variant="caption">
                            {d.totalUnrealisedCost.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 3, sm: 2 }} sx={{ textAlign: 'right' }}>
                        {!isLatest ?
                            <GridDetailItem amount={d.curTxGainAmount} amountPercentage={d.curTxGainAmountPercentage} netAmtColor={true} currency={d.displayCurrency} /> :
                            <GridDetailItem amount={d.curTxGainAmountLatest} amountPercentage={d.curTxGainAmountLatestPercentage} netAmtColor={true} currency={d.displayCurrency} />
                        }
                    </Grid>

                    <Grid size={{ xs: 3, sm: 2 }} sx={{ textAlign: 'right' }} >
                        <GridDetailItem amount={d.totalGain} amountPercentage={d.totalGainPercentage} netAmtColor={true} currency={d.displayCurrency} />
                    </Grid>
                </Grid>

                <Stack>
                    <Typography variant="caption">
                        {(
                            <>
                                YTD:&nbsp;
                                <Link
                                    component={RouterLink}
                                    underline="hover" variant="caption"
                                    sx={utils.getColorClass(d.totalYtdGain)}
                                    to={`/positions/${d.portfolioId === "Summary" ? "" : d.portfolioId}`}
                                >
                                    {d.displayCurrency} {utils.getSignedDecimal(d.totalYtdGain, 2)} {utils.getFmtSgnDec(d.totalYtdGainPercentage, 2, "(", "%)")}
                                </Link>
                            </>
                        )}

                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }} ><br /></Box>
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }} >&nbsp;</Box>
                    </Typography>

                    {d.isExcludedFromSummary && (
                        <Typography variant="caption">
                            Excluded From Summary
                        </Typography>
                    )}
                </Stack>
            </Grid>
        ))
    );
}