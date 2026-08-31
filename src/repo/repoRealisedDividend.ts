import { IChartJsDataSet } from "../types/api";
import { RealisedDividend } from "../types/db";
import { createApiRequest, getApiQueryString, getApiRoute } from "./apiRequest";

export default class repoRealisedDividend {
  static readonly baseUrl = "api/RealisedDividend";

  static Get(
    { 
      portfolioId, 
      stockId,
      market,
    }: { 
      portfolioId?: string | null; 
      stockId?: string | null;
      market?: string | null;
    } = {}
  ) {
    const baseUrl = repoRealisedDividend.baseUrl;
    const url = baseUrl + "/" + getApiRoute(portfolioId) + "?" + getApiQueryString({ stockId, market });

    return createApiRequest<RealisedDividend[]>(baseUrl, url);
  }

  static GetMonthlyChart(
    { portfolioId, stockId }: { portfolioId?: string | null; stockId?: string | null; }
  ) {
    const baseUrl = repoRealisedDividend.baseUrl + "/MonthlyChart";
    const url = baseUrl + "?" + getApiQueryString({ portfolioId, stockId });

    return createApiRequest<{ labels: string[]; dailyRealisedDividendDatasets: IChartJsDataSet[] }>(repoRealisedDividend.baseUrl, url);
  }
}
