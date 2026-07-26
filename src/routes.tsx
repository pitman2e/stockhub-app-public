import { Route, Routes } from 'react-router-dom';
import { MHome } from './pages/home/MHome';
import { MPortfoliosDetails } from './pages/portfolios-details/MPortfoliosDetails';
import { MTransactions } from './pages/transactions/MTransactions';
import { MDividends } from './pages/dividends/MDividends';
import { MPortfolioOverview } from './pages/portfolio-overview/MPortfolioOverview';
import { MPositions } from './pages/positions/MPositions';
import { MStockOverview } from './pages/stocks/MStockOverview';
import { DefaultContainer } from './components/DefaultComponents';
import { MDataAdministration } from './pages/admin/MDataAdministration';

const routesConfig = [
    { path: '/', title: 'Dashboard', element: <MHome /> },
    { path: '/portfolios-details', title: 'Portfolios Details', element: <MPortfoliosDetails /> },
    { path: '/transaction/:portfolioId?', title: 'Transactions', element: <MTransactions /> },
    { path: '/dividend/:portfolioId?', title: 'Dividends', element: <MDividends /> },
    { path: '/portfolio-overview/:portfolioId?', title: 'Portfolio Overview', element: <MPortfolioOverview /> },
    { path: '/positions/:portfolioId?', title: 'Positions', element: <MPositions /> },
    { path: '/ticker-overview/:stockId?', title: 'Ticker Overview', element: <MStockOverview /> },
    { path: '/admin', title: 'Data Administration', element: <MDataAdministration /> },
    { path: '/tags/:category?', title: 'Tags', element: null }
];

export function RoutedPageTitle() {
    return (
        <Routes>
            {routesConfig.map((route) => (
                <Route key={`title-${route.path}`} path={route.path} element={route.title} />
            ))}
            <Route path='*' element="Not Found" />
        </Routes>
    );
}

export function RoutedPage() {
    return (
        <Routes>
            {routesConfig.map((route) => (
                route.element && (
                    <Route key={`page-${route.path}`} path={route.path} element={route.element} />
                )
            ))}
            <Route path='*'
                element={
                    <DefaultContainer>
                        <h1>Page not found</h1>
                    </DefaultContainer>
                }
            />
        </Routes>
    );
}