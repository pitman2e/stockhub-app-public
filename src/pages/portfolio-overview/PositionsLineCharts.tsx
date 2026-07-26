import { ComponentProps, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import { DefaultPaper, DefaultErrorPlaceholder, DefaultLinearProgress } from '../../components/DefaultComponents';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import repoPortfolio from '../../repo/repoPortfolio';
import { IChartJsDataSet } from '../../types/api';
import DateRangeSelector, { getPresetDates } from '../../components/DateRangeSelector';

interface IPositionsLineChartsProps {
  portfolioId?: string;
  stockId?: string;
}

interface IPositionChartData {
  labels?: string[];
  unrealisedDatasets: IChartJsDataSet[];
  totalGainDatasets: IChartJsDataSet[];
  totalGainOffsetDatasets: IChartJsDataSet[];
  dailyGainDatasets: IChartJsDataSet[];
  unrealisedCostDatasets: IChartJsDataSet[];
  dailyRealisedDividendDatasets: IChartJsDataSet[];
}

type BarOptions = ComponentProps<typeof Bar>['options'];
type LineOptions = ComponentProps<typeof Line>['options'];

export function PositionsLineCharts({ portfolioId, stockId }: IPositionsLineChartsProps) {
  dayjs.extend(utc);
  const defaultDateRangePreset = 'YTD';
  const defaultDateRange = getPresetDates(defaultDateRangePreset);
  const [dateRange, setDateRange] = useState<{ fmDate: number; toDate: number }>({
    fmDate: defaultDateRange.from!.unix(),
    toDate: defaultDateRange.to!.unix(),
  });
  const [dayRes, setDayRes] = useState<number>(1);
  const theme = useTheme();

  const toDate = dateRange.toDate;
  const fmDate = dateRange.fmDate;

  const queryKeys = {
    portfolioId,
    stockId,
    dayRes,
    fmDate,
    toDate,
  };

  const { isError, data, isFetching, isSuccess } = useQuery<IPositionChartData>(repoPortfolio.GetPositionChart(queryKeys));

  if (isError) return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;

  const options: BarOptions & LineOptions =
  {
    responsive: true,
    maintainAspectRatio: true,
    backgroundColor: theme.palette.primary.main, //Point, Bar
    borderColor: theme.palette.primary.main, //Line
    elements: {
      point: {
        radius: data?.labels?.length ?? 0 < 365 ? 2 : 1,
        hitRadius: 2,
      },
      bar: {

      }
    },
    scales: {
      x: {
        ticks: {
          color: theme.palette.text.primary
        }
      },
      y: {
        ticks: {
          color: theme.palette.text.primary
        }
      }
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const stockValue = context.raw as number;
            const dataset = context.dataset as unknown as IChartJsDataSet;
            return dataset.currency + " " + stockValue.toFixed(2);
          }
        }
      }
    },
  }

  const labels = data?.labels;

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <DefaultPaper>

          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Typography variant="body2" gutterBottom={true}>
                Period
              </Typography>
              <DateRangeSelector SetStateAction={setDateRange} DefaultPreset={defaultDateRangePreset} IsNullable={false} />
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Typography variant="body2" gutterBottom={true}>
                {"Resolution (" + dayRes + " Days)"}
              </Typography>
              <ButtonGroup sx={{ height: '56px' }} variant="outlined" aria-label="outlined button group">
                <Button disabled={dayRes === 1} onClick={() => setDayRes(1)}>1D</Button>
                <Button disabled={dayRes === 7} onClick={() => setDayRes(7)}>1W</Button>
                <Button disabled={dayRes === 30} onClick={() => setDayRes(30)}>1M</Button>
              </ButtonGroup>
            </Grid>
          </Grid>

        </DefaultPaper>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        {isFetching && <DefaultLinearProgress />}
        <DefaultPaper>
          <Typography variant="h6" gutterBottom>
            Market Value
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
            {isSuccess && <Line
              data={{ labels: labels, datasets: data?.unrealisedDatasets }}
              options={options}
            />}

            {!isSuccess &&
              <CircularProgress />
            }
          </Box>
        </DefaultPaper>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        {isFetching && <DefaultLinearProgress />}

        <DefaultPaper>
          <Typography variant="h6" gutterBottom>
            Total Gain
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
            {isSuccess &&
              <Line
                data={{ labels: labels, datasets: data?.totalGainDatasets }}
                options={options}
              />}

            {!isSuccess &&
              <CircularProgress />
            }
          </Box>
        </DefaultPaper>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        {isFetching && <DefaultLinearProgress />}

        <DefaultPaper>
          <Typography variant="h6" gutterBottom>
            Total Gain (Offset)
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
            {isSuccess &&
              <Line
                data={{ labels: labels, datasets: data?.totalGainOffsetDatasets }}
                options={options}
              />}

            {!isSuccess &&
              <CircularProgress />
            }
          </Box>
        </DefaultPaper>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        {isFetching && <DefaultLinearProgress />}

        <DefaultPaper>
          <Typography variant="h6" gutterBottom>
            Daily Gain
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
            {isSuccess && <Bar
              data={{ labels: labels, datasets: data?.dailyGainDatasets }}
              options={options}
            />}

            {!isSuccess &&
              <CircularProgress />
            }
          </Box>
        </DefaultPaper>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        {isFetching && <DefaultLinearProgress />}

        <DefaultPaper>
          <Typography variant="h6" gutterBottom>
            Unrealised Cost
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
            {isSuccess && <Line
              data={{ labels: labels, datasets: data?.unrealisedCostDatasets }}
              options={options}
            />}

            {!isSuccess &&
              <CircularProgress />
            }
          </Box>
        </DefaultPaper>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        {isFetching && <DefaultLinearProgress />}

        <DefaultPaper>
          <Typography variant="h6" gutterBottom>
            Realised Dividend
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
            {isSuccess && <Bar
              data={{ labels: labels, datasets: data?.dailyRealisedDividendDatasets }}
              options={options}
            />}

            {!isSuccess &&
              <CircularProgress />
            }
          </Box>
        </DefaultPaper>
      </Grid>
    </Grid>
  )
}