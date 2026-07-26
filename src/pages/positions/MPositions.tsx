import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Grid from '@mui/material/Grid';
import { PositionsTable } from './PositionsTable';
import { useParams } from 'react-router-dom';
import utils from '../../utils/utils';
import { DefaultHeader, DefaultContainer, DefaultErrorPlaceholder } from '../../components/DefaultComponents';

export function MPositions() {
  const { portfolioId } = useParams();

  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Positions");
  })

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer key={portfolioId}>
        <DefaultHeader title="Positions" />

        <Grid container>
          <Grid size={{ xs: 12 }}>
            <PositionsTable portfolioId={portfolioId} isShowPortfolioId={false} />
          </Grid>
        </Grid>
      </DefaultContainer>
    </ErrorBoundary>
  );
}