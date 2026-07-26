import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import StockIdAutocomplete from '../../components/StockIdAutocomplete'
import RealisedDividendTable from './RealisedDividendTable';
import { useParams } from 'react-router-dom';
import utils from '../../utils/utils';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { DefaultHeader, DefaultPaper, DefaultContainer, DefaultErrorPlaceholder } from '../../components/DefaultComponents';
import MarketSelect from '../../components/MarketSelect';
import { Stack } from '@mui/system';

export function MDividends() {
  const { portfolioId } = useParams();
  const [filterStockId, setFilterStockId] = useState("");
  const [filterMarket, setFilterMarket] = useState<string>("");

  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Dividends");
  })

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer key={portfolioId}>
        <DefaultHeader title="Dividends" />

        <Stack spacing={1}>
          <DefaultPaper>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Filtering
                </Typography>
              </Grid>

              <Grid size={{ xs: 8 }}>
                <StockIdAutocomplete portfolioId={portfolioId} SetStateAction={setFilterStockId} />
              </Grid>

              <Grid size={{ xs: 4 }}>
                <MarketSelect SetStateAction={setFilterMarket} />
              </Grid>
            </Grid>
          </DefaultPaper>

          <Grid>
            <Grid size={{ xs: 12 }}>
              <RealisedDividendTable
                key={filterStockId}
                portfolioId={portfolioId}
                filterStockId={filterStockId}
                filterMarket={filterMarket}
                isShowPortfolioId={!portfolioId}
              />
            </Grid>
          </Grid>
        </Stack>
      </DefaultContainer >
    </ErrorBoundary >
  );
}