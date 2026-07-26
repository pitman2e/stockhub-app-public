import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import { repoDlProxy } from '../../repo/repoDlProxy';
import { Box } from '@mui/system';

interface IWatchlistChartProps {
    stockId: string;
}

export default function WatchlistChart({ stockId }: IWatchlistChartProps) {
    const theme = useTheme();
    const qry = useQuery(repoDlProxy.Get({ stockId }));

    if (qry.isError || !qry.isFetched) {
        return (
            <></>
        )
    }

    const prevClosePrice: number = qry.data.spark.result[0].response[0].meta.previousClose;
    const curTradeTimestamps: number[] = qry.data.spark.result[0].response[0].timestamp;
    const curTradePrices: number[] = qry.data.spark.result[0].response[0].indicators.quote[0].close;
    //const tsTradeStart = qry.data.spark.result[0].response[0].meta.currentTradingPeriod.regular.start;
    const tsTradeStart: number = qry.data.spark.result[0].response[0].meta.currentTradingPeriod.regular.start;
    const tsTradeEnd: number = qry.data.spark.result[0].response[0].meta.currentTradingPeriod.regular.end;
    const secondPerTick = 5 * 60; //300
    //const totalTicksCnt = Math.floor((tsTradeEnd - tsTradeStart) / secondPerTick)

    const options_min: ComponentProps<typeof Line>['options'] =
    {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        layout: {   
            padding: 0
        },
        elements: {
            point: {
                hitRadius: 1,
            }
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                min: Math.min(...curTradePrices.filter(price => price !== null), prevClosePrice) * 0.999,
                max: Math.max(...curTradePrices.filter(price => price !== null), prevClosePrice) * 1.001,
                ticks: {
                    callback: function (val, _index, _values) {
                        const num = typeof val === 'number' ? val : Number(val);
                        return num.toFixed(2);
                    },
                    font: {
                        size: 9
                    }
                },
                afterBuildTicks: axis => axis.ticks = [prevClosePrice].map(v => ({ value: v })),
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
            axis: 'x',
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    }

    let processingTradeTimestamp = curTradeTimestamps[curTradeTimestamps.length - 1]
    while (processingTradeTimestamp < tsTradeEnd && processingTradeTimestamp >= tsTradeStart) {
        processingTradeTimestamp += secondPerTick;
        curTradeTimestamps.push(processingTradeTimestamp);
    }

    const data_up = [];
    const data_down = [];
    const data_prevClosePrice = [];
    let isPrevUP = false;

    for (let i = 0; i < curTradePrices.length; i++) {
        if (curTradePrices[i] >= prevClosePrice) {
            if (!isPrevUP) {
                data_down.push(curTradePrices[i]);
            } else {
                data_down.push(null);
            }
            data_up.push(curTradePrices[i]);
            isPrevUP = true;
        } else {
            if (isPrevUP) {
                data_up.push(curTradePrices[i]);
            } else {
                data_up.push(null);
            }
            data_down.push(curTradePrices[i]);
            isPrevUP = false;
        }

        data_prevClosePrice.push(prevClosePrice);
    }

    return (
        <Box sx={{ position: 'relative', height: '3em', width: { xs: '9em', sm: '11em', lg: '15em' }}}>
            {qry.data && <Line
                options={options_min}
                data={{
                    labels: curTradeTimestamps.map(timestamp => dayjs.unix(timestamp).format('MM-DD HH:mm')),
                    datasets: [
                        {
                            data: data_up,
                            borderColor: theme.deltaColor.up.color,
                            borderWidth: 1.1,
                            pointRadius: 0,
                        },
                        {
                            data: data_down,
                            borderColor: theme.deltaColor.down.color,
                            borderWidth: 1.1,
                            pointRadius: 0,
                        },
                        {
                            fill: false,
                            backgroundColor: theme.chartGreyLine.color,
                            borderColor: theme.chartGreyLine.color,
                            borderDash: [5, 5],
                            borderWidth: 0.3,
                            pointRadius: 0,
                            data: data_prevClosePrice,
                        },
                    ]
                }}>
            </Line>}
        </Box>
    );
}