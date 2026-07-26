import React from 'react';
import Grid from '@mui/material/Grid';
import { ErrorBoundary } from 'react-error-boundary';
import utils from '../../utils/utils';
import { DefaultContainer, DefaultErrorPlaceholder, DefaultHeader } from '../../components/DefaultComponents';
import TopMover from './TopMover';
import Watchlist from './Watchlist';
import PortfolioListSummary from './PortfolioListSummary';

export const MHome = () => {
  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Home");
  })

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer>
        <DefaultHeader title="Dashboard" />

        <Grid container sx={{ alignItems: "flex-start" }} spacing={1}>
          <Grid container size={{ xs: 12, xl: 6 }} >
            <Grid size={{ xs: 12 }}>
              <PortfolioListSummary />
            </Grid>
          </Grid>

          <Grid container size={{ xs: 12, xl: 6 }} spacing={1}>
            <Grid size={{ xs: 12 }}>
              <Watchlist />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TopMover />
            </Grid>
          </Grid>
        </Grid>
      </DefaultContainer>
    </ErrorBoundary>
  )
}
