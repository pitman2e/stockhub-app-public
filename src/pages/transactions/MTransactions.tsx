import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import utils from '../../utils/utils';
import Grid from '@mui/material/Grid';
import { DefaultContainer, DefaultHeader, DefaultErrorPlaceholder } from '../../components/DefaultComponents';
import StockTransactionTable from './StockTransactionTable'

export function MTransactions() {
  const { portfolioId } = useParams();

  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Transactions");
  })

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer key={portfolioId}>
        <DefaultHeader title="Transactions" />

        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <StockTransactionTable
              key={portfolioId}
              portfolioId={portfolioId}
            />
          </Grid>
        </Grid>
      </DefaultContainer>
    </ErrorBoundary>
  );
}