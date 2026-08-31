import { Route, Routes } from "react-router-dom";
import { MHome } from "./pages/home/MHome";
import { MPortfoliosDetails } from "./pages/portfolios-details/MPortfoliosDetails";
import { MTransactions } from "./pages/transactions/MTransactions";
import { MDividends } from "./pages/dividends/MDividends";
import { MPortfolioOverview } from "./pages/portfolio-overview/MPortfolioOverview";
import { MPositions } from "./pages/positions/MPositions";
import { MStockOverview } from "./pages/stocks/MStockOverview";
import { DefaultContainer } from "./components/DefaultComponents";
import { MDataAdministration } from "./pages/admin/MDataAdministration";

// Single source of truth for all app route paths.
// All navigation (`to=`, `navigate()`) and `selected` checks must derive
// from ROUTE_PATHS / the builders below instead of hardcoding strings.
export const ROUTE_PATHS = {
  home: "/",
  portfoliosDetails: "/portfolios-details",
  transaction: "/transaction",
  dividend: "/dividend",
  portfolioOverview: "/portfolio-overview",
  positions: "/positions",
  tickerOverview: "/ticker-overview",
  admin: "/admin",
  tags: "/tags",
} as const;

export function buildRoutePath(base: string, param?: string): string {
  if (!param) {
    return base;
  }
  return `${base}/${param}`;
}

export function getPortfoliosDetailsPath(): string {
  return ROUTE_PATHS.portfoliosDetails;
}

export function getTransactionPath(portfolioId?: string): string {
  return buildRoutePath(ROUTE_PATHS.transaction, portfolioId);
}

export function getDividendPath(portfolioId?: string): string {
  return buildRoutePath(ROUTE_PATHS.dividend, portfolioId);
}

export function getPortfolioOverviewPath(portfolioId?: string): string {
  return buildRoutePath(ROUTE_PATHS.portfolioOverview, portfolioId);
}

export function getPositionsPath(portfolioId?: string): string {
  return buildRoutePath(ROUTE_PATHS.positions, portfolioId);
}

export function getTickerOverviewPath(stockId?: string): string {
  return buildRoutePath(ROUTE_PATHS.tickerOverview, stockId);
}

export function normalizeRoutePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export function isRouteActive(
  pathname: string,
  base: string,
  param?: string,
): boolean {
  return (
    normalizeRoutePath(pathname) ===
    normalizeRoutePath(buildRoutePath(base, param))
  );
}

const routesConfig = [
  { path: ROUTE_PATHS.home, title: "Dashboard", element: <MHome /> },
  {
    path: ROUTE_PATHS.portfoliosDetails,
    title: "Portfolios Details",
    element: <MPortfoliosDetails />,
  },
  {
    path: `${ROUTE_PATHS.transaction}/:portfolioId?`,
    title: "Transactions",
    element: <MTransactions />,
  },
  {
    path: `${ROUTE_PATHS.dividend}/:portfolioId?`,
    title: "Dividends",
    element: <MDividends />,
  },
  {
    path: `${ROUTE_PATHS.portfolioOverview}/:portfolioId?`,
    title: "Portfolio Overview",
    element: <MPortfolioOverview />,
  },
  {
    path: `${ROUTE_PATHS.positions}/:portfolioId?`,
    title: "Positions",
    element: <MPositions />,
  },
  {
    path: `${ROUTE_PATHS.tickerOverview}/:stockId?`,
    title: "Ticker Overview",
    element: <MStockOverview />,
  },
  {
    path: ROUTE_PATHS.admin,
    title: "Data Administration",
    element: <MDataAdministration />,
  },
  { path: `${ROUTE_PATHS.tags}/:category?`, title: "Tags", element: null },
];

export function RoutedPageTitle() {
  return (
    <Routes>
      {routesConfig.map((route) => (
        <Route
          key={`title-${route.path}`}
          path={route.path}
          element={route.title}
        />
      ))}
      <Route path="*" element="Not Found" />
    </Routes>
  );
}

export function RoutedPage() {
  return (
    <Routes>
      {routesConfig.map(
        (route) =>
          route.element && (
            <Route
              key={`page-${route.path}`}
              path={route.path}
              element={route.element}
            />
          ),
      )}
      <Route
        path="*"
        element={
          <DefaultContainer>
            <h1>Page not found</h1>
          </DefaultContainer>
        }
      />
    </Routes>
  );
}
