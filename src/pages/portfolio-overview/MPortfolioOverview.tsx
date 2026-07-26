import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Grid from '@mui/material/Grid';
import { PortfolioSummaryPieChart } from './PortfolioSummaryPieChart';
import { PositionsLineCharts } from './PositionsLineCharts';
import { useParams } from 'react-router-dom';
import { PortfolioSummary } from './PortfolioSummary';
import utils from '../../utils/utils';
import { DefaultHeader, DefaultContainer, DefaultErrorPlaceholder } from '../../components/DefaultComponents';

export function MPortfolioOverview() {
  const { portfolioId } = useParams();

  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Portfolio Overview");
  })

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer key={portfolioId}>
        <DefaultHeader title="Portfolio Overview" />

        <Grid container sx={{ alignItems: "stretch" }} spacing={1}>
          <Grid size={{ xs: 12, sm: 12, xl: 4 }}>
            <PortfolioSummary portfolioId={portfolioId} isForcedSummary={true} />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, xl: 8 }}>
            <PortfolioSummaryPieChart portfolioId={portfolioId} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PositionsLineCharts
              portfolioId={portfolioId}
              stockId='' />
          </Grid>
        </Grid>
      </DefaultContainer>
    </ErrorBoundary>
  );
}