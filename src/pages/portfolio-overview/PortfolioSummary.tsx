import { Skeleton, Theme } from '@mui/material'
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { DefaultErrorPlaceholder, DefaultLinearProgress, DefaultPaper } from '../../components/DefaultComponents';
import repoPortfolio from '../../repo/repoPortfolio';
import { IStockSummary } from "../../types/api";
import utils from '../../utils/utils';

interface IPortfolioSummaryProps {
    portfolioId: string | undefined;
    isForcedSummary?: boolean;
}

export function PortfolioSummary({ portfolioId, isForcedSummary }: IPortfolioSummaryProps) {
    const { isSuccess, isError, data, isFetching } = useQuery(repoPortfolio.GetSummary({ portfolioId: portfolioId }));

    if (isError) return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;

    let d: IStockSummary | null = null;

    if (isSuccess && !!data) {
        d = isForcedSummary || !portfolioId ? data.summary : data.details[0];
    }

    return (
        <>
            {isFetching && <DefaultLinearProgress />}
            <DefaultPaper key={d?.portfolioId}>
                <Grid container>
                    <Grid container size={{ xs: 3 }}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body1" gutterBottom={true}>
                                Summary
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <GridDetailItem
                                isLoading={!isSuccess}
                                title="Market Value"
                                disablePosSign={true}
                                amount={d?.totalUnrealisedAmount}
                                currency={d?.displayCurrency} />
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} size={{ xs: 9 }} sx={{ textAlign: 'right' }}>
                        <Grid size={{ xs: 6 }}>
                            <GridDetailItem
                                isLoading={!isSuccess}
                                title="Unrealised Gain"
                                amount={d?.totalUnrealisedGain}
                                amountPercentage={d?.totalUnrealisedGainPercentage}
                                netAmtColor={true} />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                            <GridDetailItem
                                isLoading={!isSuccess}
                                title="Daily Gain"
                                amount={d?.curTxGainAmount}
                                amountPercentage={d?.curTxGainAmountPercentage}
                                netAmtColor={true} />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                            <GridDetailItem
                                isLoading={!isSuccess}
                                title="Realised Gain"
                                amount={d?.totalRealisedGain}
                                amountPercentage={d?.totalRealisedGainPercentage}
                                netAmtColor={true} />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                            <GridDetailItem
                                isLoading={!isSuccess}
                                title="P&amp;L"
                                amount={d?.totalGain}
                                amountPercentage={d?.totalGainPercentage}
                                netAmtColor={true} />
                        </Grid>
                    </Grid>
                </Grid>
            </DefaultPaper>
        </>
    );
}

interface IGridDetailItemProps {
    isLoading?: boolean,
    title: string
    netAmtColor?: boolean
    amount?: number
    amountPercentage?: number | null
    disablePosSign?: boolean
    currency?: string
}

function GridDetailItem({ isLoading, title, netAmtColor, amount, amountPercentage, disablePosSign, currency }: IGridDetailItemProps) {
    const sxColor = (theme: Theme) => (!netAmtColor || !amount) ? null : (amount < 0 ? theme.deltaColor.down : theme.deltaColor.up)

    const percentagePart = amountPercentage ? ` (${utils.getSignedDecimal(amountPercentage, 2, disablePosSign)}%)` : ''

    return (
        <Grid container sx={{ flexDirection: 'column' }}>
            <Typography variant="caption" component="p">
                {title}
            </Typography>

            {isLoading && <Skeleton width="100%" />}
            {!isLoading &&
                <Typography
                    variant="body2"
                    component="p"
                    gutterBottom={true}
                    sx={(theme) => ({ color: sxColor(theme) })}
                >
                    <Typography variant="caption">
                        {!currency ? "" : currency + ' '}
                    </Typography>

                    {utils.getSignedDecimal(amount, 2, disablePosSign) + percentagePart}
                </Typography>
            }
        </Grid>
    )
}
