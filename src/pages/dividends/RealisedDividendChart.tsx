import { ComponentProps, useState } from 'react';
import Grid from '@mui/material/Grid';
import { DefaultErrorPlaceholder, DefaultLinearProgress, DefaultPaper } from '../../components/DefaultComponents';
import { useQuery } from '@tanstack/react-query';
import repoRealisedDividend from '../../repo/repoRealisedDividend';
import { Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { CircularProgress } from '@mui/material';
import { ListItemButton } from '@mui/material';
import { ListItemText, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { IChartJsDataSet } from '../../types/api';

interface IRealisedDividendChartProps {
  portfolioId: string | undefined;
  stockId: string;
}

type BarOptions = ComponentProps<typeof Bar>['options'];

export default function RealisedDividendChart({ portfolioId, stockId }: IRealisedDividendChartProps) {
  const [open, setOpen] = useState(false);

  const queryKeys = {
    portfolioId: portfolioId,
    stockId: stockId,
  }

  const theme = useTheme();

  const { isError, data, isFetching, isSuccess } =
    useQuery(
      {
        ...repoRealisedDividend.GetMonthlyChart(queryKeys),
      }
    );

  if (isError) return <DefaultPaper><DefaultErrorPlaceholder /></DefaultPaper>;

  const options: BarOptions =
  {
    responsive: true,
    maintainAspectRatio: true,
    backgroundColor: theme.palette.primary.main, //Point, Bar
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
    elements: {
      point: {
        radius: 5,
        hitRadius: 2
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const stockValue = context.raw as number;
            const dataset = context.dataset as unknown as IChartJsDataSet;
            return ` ${dataset.currency} ${stockValue.toFixed(2)}`;
          }
        }
      }
    },
  }

  const labels = data?.labels;

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        {isFetching && <DefaultLinearProgress />}

        <DefaultPaper>
          <ListItemButton onClick={() => setOpen((prevOpen) => !prevOpen)}>
            <ListItemText>
              <Typography variant="h6">
                Realised Dividends Summary
              </Typography>
            </ListItemText>
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={open} timeout="auto" unmountOnExit>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '500/250' }}>
              {isSuccess && <Bar
                data={{ labels: labels, datasets: data?.dailyRealisedDividendDatasets }}
                options={options}
              />}
              {!isSuccess && <CircularProgress />}
            </Box>
          </Collapse>
        </DefaultPaper>
      </Grid>
    </Grid>
  )
}