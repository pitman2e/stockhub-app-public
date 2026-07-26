import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { ComponentProps } from "react";
import { repoDlProxy } from "../../repo/repoDlProxy";
import { Box } from "@mui/system";

interface IWatchlistChartProps {
  stockId: string;
}

export default function WatchlistChart({ stockId }: IWatchlistChartProps) {
  const theme = useTheme();
  const qry = useQuery(repoDlProxy.Get({ stockId }));

  if (qry.isError || !qry.isFetched) {
    return <></>;
  }

  const prevClosePrice: number =
    qry.data.spark.result[0].response[0].meta.previousClose;
  const curTradeTimestamps: number[] = Array.from(
    qry.data.spark.result[0].response[0].timestamp,
  ); // Shadow copy of a React State before mutation
  const curTradePrices: number[] = Array.from(
    qry.data.spark.result[0].response[0].indicators.quote[0].close,
  ); // Shadow copy of a React State
  //const tsTradeStart = qry.data.spark.result[0].response[0].meta.currentTradingPeriod.regular.start;
  const tsTradeStart: number =
    qry.data.spark.result[0].response[0].meta.currentTradingPeriod.regular
      .start;
  const tsTradeEnd: number =
    qry.data.spark.result[0].response[0].meta.currentTradingPeriod.regular.end;
  const secondPerTick = 5 * 60; //300
  //const totalTicksCnt = Math.floor((tsTradeEnd - tsTradeStart) / secondPerTick)

  const options_min: ComponentProps<typeof Line>["options"] = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    elements: {
      point: {
        hitRadius: 1,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min:
          Math.min(
            ...curTradePrices.filter((price) => price !== null),
            prevClosePrice,
          ) * 0.999,
        max:
          Math.max(
            ...curTradePrices.filter((price) => price !== null),
            prevClosePrice,
          ) * 1.001,
        ticks: {
          callback: function (val, _index, _values) {
            const num = typeof val === "number" ? val : Number(val);
            return num.toFixed(2);
          },
          font: {
            size: 9,
          },
        },
        afterBuildTicks: (axis) =>
          (axis.ticks = [prevClosePrice].map((v) => ({ value: v }))),
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
      axis: "x",
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  let processingTradeTimestamp =
    curTradeTimestamps[curTradeTimestamps.length - 1];
  while (
    processingTradeTimestamp < tsTradeEnd &&
    processingTradeTimestamp >= tsTradeStart
  ) {
    processingTradeTimestamp += secondPerTick;
    curTradeTimestamps.push(processingTradeTimestamp);
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: "3em",
        width: { xs: "9em", sm: "11em", lg: "15em" },
      }}
    >
      {qry.data && (
        <Line
          options={options_min}
          data={{
            labels: curTradeTimestamps.map((timestamp) =>
              dayjs.unix(timestamp).format("MM-DD HH:mm"),
            ),
            datasets: [
              {
                data: curTradePrices,
                borderWidth: 1.1,
                pointRadius: 0,

                // Mouse hover legend color
                pointBackgroundColor: (ctx) => {
                  const price = ctx.parsed.y;

                  if (price == null) {
                    return undefined;
                  }

                  return price >= prevClosePrice
                    ? theme.deltaColor.up.color
                    : theme.deltaColor.down.color;
                },

                // Line color
                segment: {
                  borderColor: (ctx) => {
                    const p0 = ctx.p0.parsed.y;
                    const p1 = ctx.p1.parsed.y;

                    if (p0 == null || p1 == null) {
                      return undefined;
                    }

                    return p0 >= prevClosePrice && p1 >= prevClosePrice
                      ? theme.deltaColor.up.color
                      : theme.deltaColor.down.color;
                  },
                },
              },
              {
                fill: false,
                backgroundColor: theme.chartGreyLine.color,
                borderColor: theme.chartGreyLine.color,
                borderDash: [5, 5],
                borderWidth: 0.3,
                pointRadius: 0,
                data: Array(curTradeTimestamps.length).fill(prevClosePrice),
              },
            ],
          }}
        ></Line>
      )}
    </Box>
  );
}
