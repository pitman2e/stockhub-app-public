import { ComponentProps } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import { DefaultLinearProgress, DefaultPaper } from "../../components/DefaultComponents";
import ImminentErrorIcon from "../../components/ImminentErrorIcon";
import * as utils from "../../utils/utils";
import { useQuery } from "@tanstack/react-query";
import repoStockPrice from "../../repo/repoStockPrice";
import ApiRequestAdapter from "../../adapters/apiRequestAdapter";
import * as chartJsTouchUtils from "../../utils/chartJsTouchUtils";

interface ITickerPerformanceProps {
  stockId?: string;
}

type BarOptions = ComponentProps<typeof Bar>["options"];

const clearTouchPlugin = chartJsTouchUtils.createClearTouchPlugin();

export default function TickerPerformance({ stockId }: ITickerPerformanceProps) {
  const theme = useTheme();

  const { isError, data, isFetching } = useQuery({
    ...ApiRequestAdapter.queryOptions(repoStockPrice.GetPerformance({ stockId })),
    enabled: !!stockId,
  });

  if (isError && data === undefined) return null;

  const labels = [
    "From Top",
    "1-Month",
    "3-Month",
    "YTD",
    "1-Year",
    "3-Year",
    "5-Year",
  ];

  const options: BarOptions = {
    events: [...chartJsTouchUtils.touchSafeChartEvents],
    responsive: true,
    maintainAspectRatio: true,
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    scales: {
      x: {
        ticks: {
          color: theme.palette.text.primary,
        },
      },
      y: {
        ticks: {
          color: theme.palette.text.primary,
          callback: function (value) {
            return `${value}%`;
          },
        },
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const stockValue = context.raw as number | null;
            if (stockValue === null || stockValue === undefined) {
              return "";
            }
            return utils.getFmtSgnDec(stockValue, 2, "", "%");
          },
        },
      },
    },
  };

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <DefaultPaper>
        <Typography variant="h6" gutterBottom>
          Performance {isError && <ImminentErrorIcon />}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            aspectRatio: "500/250",
          }}
        >
          {data !== undefined ? (
            <Bar
              data={{
                labels: labels,
                datasets: [
                  {
                    label: "Performance",
                    data: [
                      data.dropFromTop,
                      data.oneMonth,
                      data.threeMonth,
                      data.ytd,
                      data.oneYear,
                      data.threeYear,
                      data.fiveYear,
                    ],
                  },
                ],
              }}
              options={options}
              plugins={[clearTouchPlugin]}
            />
          ) : (
            <CircularProgress />
          )}
        </Box>
      </DefaultPaper>
    </>
  );
}
