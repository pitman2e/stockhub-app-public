import {
  IStockMovements,
  IWatchlistDeleteDto,
  IWatchlistPostDto,
} from "../types/api";
import { createApiRequest, getApiQueryString } from "./apiRequest";

export default class repoWatchlist {
  static readonly baseUrl = "api/Watchlist";

  static Get({ topCnt }: { topCnt?: number | null }) {
    const baseUrl = repoWatchlist.baseUrl;
    const url = baseUrl + "?" + getApiQueryString({ topCnt });

    return createApiRequest<IStockMovements>(baseUrl, url);
  }

  static Delete(content: IWatchlistDeleteDto) {
    const baseUrl = repoWatchlist.baseUrl;

    return createApiRequest(baseUrl, baseUrl, "DELETE", content);
  }

  static Post(content: IWatchlistPostDto) {
    const baseUrl = repoWatchlist.baseUrl;

    return createApiRequest(baseUrl, baseUrl, "POST", content);
  }
}
