import { IChartJsDataSet } from "../types/api";
import { RealisedDividend } from "../types/db";
import utils from "../utils/utils";

export default class repoRealisedDividend {
  static readonly baseUrl = "api/RealisedDividend";

  static Get(
    { 
      portfolioId, 
      stockId,
      market,
    }: { 
      portfolioId?: string | null | undefined; 
      stockId?: string | null | undefined;
      market?: string | null | undefined;
    } = {}
  ) {
    const baseUrl = repoRealisedDividend.baseUrl;
    const url = baseUrl + "/" + utils.getQueryRoute(portfolioId) + "?" + utils.getQueryStringFromDict({ stockId, market });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, portfolioId, stockId, market }),
      queryFn: utils.getReactQueryFn<RealisedDividend[]>(url),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }

  static GetMonthlyChart(
    { portfolioId, stockId }: { portfolioId?: string | null; stockId?: string | null; }
  ) {
    const baseUrl = repoRealisedDividend.baseUrl + "/MonthlyChart";
    const url = baseUrl + "?" + utils.getQueryStringFromDict({ portfolioId, stockId });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, portfolioId, stockId }),
      queryFn: utils.getReactQueryFn<{ labels: string[]; dailyRealisedDividendDatasets: IChartJsDataSet[] }>(url),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
