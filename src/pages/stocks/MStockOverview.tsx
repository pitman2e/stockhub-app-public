import React, { ComponentProps, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import StockIdAutocomplete from '../../components/StockIdAutocomplete'
import { useParams, useNavigate } from 'react-router-dom';
import utils from '../../utils/utils';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { DefaultHeader, DefaultPaper, DefaultContainer, DefaultLinearProgress, DefaultErrorPlaceholder } from '../../components/DefaultComponents';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import StockDividendTable from './StockDividendTable';
import StocksTable from './StocksTable';

//https://www.chartjs.org/docs/3.3.0/getting-started/integration.html#bundlers-webpack-rollup-etc
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import AssetClassSelect from '../../components/AssetClassSelect';
import repoStockPrice from '../../repo/repoStockPrice';

export function MStockOverview() {
  const navigate = useNavigate();
  const { portfolioId, stockId } = useParams();
  const [dateBack, setDateBack] = useState(6);
  const [assetClasses, setAssetClasses] = useState(["STOCK"]);
  const [nav2StockId, setNav2StockId] = useState<string>("");

  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Ticker Overview");
  })

  const now = dayjs();
  const toDate = now.clone().startOf('day').unix();
  const fmDate = now.clone().startOf('day').add(-dateBack, 'M').unix()

  const queryKeys = {
    stockId: stockId,
    fmDate: fmDate,
    toDate: toDate,
    assetClasses: assetClasses.join(","),
  }

  const { data: dataChart, isFetching } =
    useQuery(
      {
        ...repoStockPrice.GetStockPricesChart(queryKeys),
        enabled: Boolean(stockId),
      }
    );

  const { data: dataPerf } = useQuery({
    ...repoStockPrice.GetPerformance({ stockId }),
    enabled: !!stockId,
  });

  const handleAutoCompleteOnChange: ComponentProps<typeof StockIdAutocomplete>['onChange'] = (event, value) => {
    if (value != null) {
      navigate(`/ticker-overview/${value.stockId}`);
    } else {
      navigate(`/ticker-overview/`)
    }
  }

  React.useEffect(() => {
    if (nav2StockId) {
      navigate(`/ticker-overview/${nav2StockId ?? ""}`);
    }
  }, [nav2StockId])

  const options: ComponentProps<typeof Line>['options'] =
  {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const stockValue = context.raw as number;
            return stockValue.toFixed(2);
          }
        }
      }
    },
  }

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer key={(portfolioId ?? "") + (stockId ?? "")}>
        <DefaultHeader title="Ticker Overview" />

        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <DefaultPaper>
              <Typography variant="h6" gutterBottom>
                Filtering
              </Typography>

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <StockIdAutocomplete
                    key={stockId}
                    portfolioId={portfolioId}
                    stockId={stockId}
                    isOpenPosOnly={true}
                    onChange={handleAutoCompleteOnChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <AssetClassSelect
                    onChange={(stringifiedValue) => setAssetClasses(stringifiedValue)}
                    defaultValues={assetClasses}
                  />
                </Grid>
              </Grid>
            </DefaultPaper>
          </Grid>

          <Grid container size={{ xs: 12, sm: 4 }} sx={{ alignContent: 'start' }} >
            {(stockId ?? "") !== "" &&
              <Grid size={{ xs: 12 }}>
                {stockId !== "" && dataPerf !== undefined &&
                  <DefaultPaper>
                    <Typography variant="h6" gutterBottom>
                      Ticker Info
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {dataPerf.stock.stockId}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {dataPerf.stock.stockName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Asset Class: {dataPerf.stock.assetClass}
                    </Typography>

                    {dataPerf.stock.assetClass === "BOND" &&
                      <>
                        <Typography variant="body1" gutterBottom>
                          Maturity Date: {dataPerf.stock.maturityDate}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Coupon: {dataPerf.stock.coupon}%
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Coupon Freq: {dataPerf.stock.couponFreq}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Face Value: {dataPerf.stock.faceValue}
                        </Typography>
                      </>
                    }
                  </DefaultPaper>
                }
              </Grid>
            }

            {(stockId ?? "") !== "" &&
              <Grid size={{ xs: 12 }}>
                {stockId !== "" && dataPerf !== undefined &&
                  <DefaultPaper>
                    <Typography variant="h6" gutterBottom>
                      Performance
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      From Top: {utils.getFmtSgnDec(dataPerf?.dropFromTop, 2, "", "%")}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      YTD: {utils.getFmtSgnDec(dataPerf?.ytd, 2, "", "%")}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      1-Month: {utils.getFmtSgnDec(dataPerf?.oneMonth, 2, "", "%")}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      3-Month: {utils.getFmtSgnDec(dataPerf?.threeMonth, 2, "", "%")}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      1-Year: {utils.getFmtSgnDec(dataPerf?.oneYear, 2, "", "%")}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      3-Year: {utils.getFmtSgnDec(dataPerf?.threeYear, 2, "", "%")}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      5-Year: {utils.getFmtSgnDec(dataPerf?.fiveYear, 2, "", "%")}
                    </Typography>
                  </DefaultPaper>
                }
              </Grid>
            }
          </Grid>

          {(stockId ?? "") !== "" &&
            <Grid size={{ xs: 12, sm: 8 }}>
              {isFetching && <DefaultLinearProgress />}
              <DefaultPaper>
                <Typography variant="h6" gutterBottom>
                  Stock Price
                </Typography>

                <ButtonGroup variant="outlined" aria-label="outlined button group">
                  <Button disabled={dateBack === 3} onClick={() => setDateBack(3)}>3-Month</Button>
                  <Button disabled={dateBack === 6} onClick={() => setDateBack(6)}>6-Month</Button>
                  <Button disabled={dateBack === 12} onClick={() => setDateBack(12)}>1-Year</Button>
                  <Button disabled={dateBack === 36} onClick={() => setDateBack(36)}>3-Year</Button>
                </ButtonGroup>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '1024/521' }}>
                  {dataChart !== undefined &&
                    <Line
                      data={{ labels: dataChart?.labels, datasets: dataChart?.stockPriceDatasets }}
                      options={options}
                    />
                  }
                </Box>

              </DefaultPaper>
            </Grid>
          }

          {(stockId ?? "") === "" &&
            <Grid size={{ xs: 12 }}>
              <StocksTable key={assetClasses.join("|")} assetClasses={assetClasses} />
            </Grid>
          }

          {(stockId ?? "") !== "" &&
            <Grid size={{ xs: 12 }}>
              <StockDividendTable
                key={(stockId ?? "") + "|" + (portfolioId ?? "")}
                portfolioId={portfolioId}
                stockId={stockId}
              />
            </Grid>
          }
        </Grid>
      </DefaultContainer>
    </ErrorBoundary >
  );
}
