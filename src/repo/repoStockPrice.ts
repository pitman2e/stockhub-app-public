import { IStockTopMovers, IStockPriceDatasets, IPerformance } from "../types/api";
import utils from "../utils/utils";

export default class repoStockPrice {
  static readonly baseUrl = "api/StockPrice";

  static GetTopMovers({ topCnt }: { topCnt?: number | null }) {
    const baseUrl = repoStockPrice.baseUrl + "/TopMoving";
    const url = baseUrl + "?" + utils.getQueryStringFromDict({ topCnt });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, topCnt }),
      queryFn: utils.getReactQueryFn<IStockTopMovers>(url),
    };
  }

  static GetStockPricesChart({ stockId, fmDate, toDate, assetClasses }: { stockId?: string | null; fmDate?: number | null; toDate?: number | null; assetClasses?: string | null } = {}) {
    const baseUrl = repoStockPrice.baseUrl + "/StockPricesChart";
    const url = baseUrl + "?" + utils.getQueryStringFromDict({ stockId, fmDate, toDate, assetClasses });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, stockId, fmDate, toDate, assetClasses }),
      queryFn: utils.getReactQueryFn<IStockPriceDatasets>(url),
    };
  }

  static GetPerformance({ stockId }: { stockId?: string | null }) {
    const baseUrl = repoStockPrice.baseUrl + "/Performance";
    const url = baseUrl + "?" + utils.getQueryStringFromDict({ stockId });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, stockId }),
      queryFn: utils.getReactQueryFn<IPerformance>(url),
    };
  }
}
