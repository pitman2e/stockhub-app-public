import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import utils from '../../utils/utils';
import StockPortfoliosDetailsTable from './PortfoliosDetailsTable';
import { DefaultHeader, DefaultContainer, DefaultErrorPlaceholder } from '../../components/DefaultComponents';

export const MPortfoliosDetails = () => {
  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Portfolios Details");
  })

  return (
    <ErrorBoundary fallback={<DefaultErrorPlaceholder />}>
      <DefaultContainer>
        <DefaultHeader title="Portfolios Details" />

        <StockPortfoliosDetailsTable />
      </DefaultContainer>
    </ErrorBoundary>
  )
}