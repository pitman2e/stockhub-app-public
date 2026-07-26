import React, { ComponentProps } from 'react';
import colors from '../../ui/colors';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { DefaultErrorPlaceholder, DefaultPaper, DefaultLinearProgress } from '../../components/DefaultComponents';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress, Container, Paper, InputLabel, MenuItem, Select, FormControl } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';

//https://www.chartjs.org/docs/3.3.0/getting-started/integration.html#bundlers-webpack-rollup-etc
import 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import repoPortfolio from '../../repo/repoPortfolio';
import { IChartJsDataSet } from '../../types/api';
import { MTags } from './MTags';

interface IPortfolioSummaryPieChartProps {
  portfolioId: string | undefined;
}

type DoughnutOptions = ComponentProps<typeof Doughnut>['options'];

export function PortfolioSummaryPieChart({ portfolioId }: IPortfolioSummaryPieChartProps) {
  const [dataFilter, setDataFilter] = React.useState({ tag: "", assetClass: "" });
  const [dialogStateTag, setDialogStateTag] = React.useState<{ isOpen: boolean, content: string | null }>({ isOpen: false, content: "" })
  const theme = useTheme();
  const { data, isFetching, isSuccess, isError } = useQuery(repoPortfolio.GetPortfolioPie({ portfolioId, ...dataFilter }));

  const options: DoughnutOptions = {
    aspectRatio: 3,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          color: theme.palette.text.primary,
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const stockName = context.label;
            const stockValue = context.raw as number;
            const dataset = context.dataset as unknown as IChartJsDataSet;
            const chart = context.chart; // Access the chart instance

            let totalValue = 0;
            for (let i = 0; i < dataset.data.length; i++) {
              // Only add the value to the total if the data point is currently visible
              if (chart.getDataVisibility(i)) {
                totalValue += dataset.data[i];
              }
            }

            // Handle edge case where totalValue might be 0 to avoid NaN
            const stockValPercentage = totalValue > 0
              ? (100 * stockValue / totalValue).toFixed(2)
              : "0.00";

            const label = ` ${stockName} : ${dataset.currency} ${stockValue.toFixed(2)} (${stockValPercentage}%)`;

            return label;
          }
        }
      }
    },
    elements: {
      arc: {
        backgroundColor: function (context) {
          const index = context.dataIndex;
          const dataset = context.dataset as unknown as IChartJsDataSet;
          const apiColor = dataset.customBackgroundColor[index]
          if (apiColor) {
            return apiColor;
          } else
            return colors[index % colors.length];
        }
      }
    }
  }

  if (isError) {
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );
  }

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <Paper sx={{ padding: 2, height: '100%' }}>
        <Grid container>
          <Grid size="grow">
            <Typography variant="h6" gutterBottom>
              Asset Allocation
            </Typography>
          </Grid>

          <IconButton
            disabled={!dataFilter.tag}
            onClick={() => setDialogStateTag({ isOpen: true, content: dataFilter.tag })}
            size="small"
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
        </Grid>

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="select-tag-label">Tag</InputLabel>
          <Select
            labelId="select-tag"
            id="select-tag"
            label="Tag"
            value={dataFilter.tag}
            onChange={(event) => {
              setDataFilter({ ...dataFilter, tag: event.target.value });
            }}
          >
            <MenuItem value="">-</MenuItem>
            <MenuItem value={"COUNTRY"}>Country</MenuItem>
            <MenuItem value={"SECTOR"}>Sector</MenuItem>
            <MenuItem value={"HOLDING"}>Holding</MenuItem>
            <MenuItem value={"CLASS"}>Class</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="select-class-label">Class</InputLabel>
          <Select
            labelId="select-class"
            id="select-class"
            label="Class"
            value={dataFilter.assetClass}
            onChange={(event) => {
              setDataFilter({ ...dataFilter, assetClass: event.target.value });
            }}
          >
            <MenuItem value="">-</MenuItem>
            <MenuItem value={"STOCK"}>Stock</MenuItem>
            <MenuItem value={"BOND"}>Bond</MenuItem>
            <MenuItem value={"MANUAL"}>Manual</MenuItem>
          </Select>
        </FormControl>

        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '1040/346' }}>
          {isSuccess && <Doughnut data={data} options={options} />}
          {!isSuccess && <CircularProgress />}
        </Container>
      </Paper>
      {dialogStateTag.isOpen && <MTags category={dialogStateTag.content} onDialogClose={() => setDialogStateTag({ isOpen: false, content: null })} />}
    </>
  )
}