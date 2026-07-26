import { IStockTopMovers, IStockPriceDatasets, IPerformance } from "../types/api";
import { createApiRequest, getApiQueryString } from "./apiRequest";

export default class repoStockPrice {
  static readonly baseUrl = "api/StockPrice";

  static GetTopMovers({ topCnt }: { topCnt?: number | null }) {
    const baseUrl = repoStockPrice.baseUrl + "/TopMoving";
    const url = baseUrl + "?" + getApiQueryString({ topCnt });

    return createApiRequest<IStockTopMovers>(repoStockPrice.baseUrl, url);
  }

  static GetStockPricesChart({ stockId, fmDate, toDate, assetClasses }: { stockId?: string | null; fmDate?: number | null; toDate?: number | null; assetClasses?: string | null } = {}) {
    const baseUrl = repoStockPrice.baseUrl + "/StockPricesChart";
    const url = baseUrl + "?" + getApiQueryString({ stockId, fmDate, toDate, assetClasses });

    return createApiRequest<IStockPriceDatasets>(repoStockPrice.baseUrl, url);
  }

  static GetPerformance({ stockId }: { stockId?: string | null }) {
    const baseUrl = repoStockPrice.baseUrl + "/Performance";
    const url = baseUrl + "?" + getApiQueryString({ stockId });

    return createApiRequest<IPerformance>(repoStockPrice.baseUrl, url);
  }
}
