import {
  IStockMovements,
  IWatchlistDeleteDto,
  IWatchlistPostDto,
} from "../types/api";
import utils from "../utils/utils";

export default class repoWatchlist {
  static readonly baseUrl = "api/Watchlist";

  static Get({ topCnt }: { topCnt?: number | null }) {
    const baseUrl = repoWatchlist.baseUrl;
    const url = baseUrl + "?" + utils.getQueryStringFromDict({ topCnt });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, topCnt }),
      queryFn: utils.getReactQueryFn<IStockMovements>(url),
    };
  }

  static Delete(content: IWatchlistDeleteDto) {
    const baseUrl = repoWatchlist.baseUrl;

    return {
      requestFn: () => utils.requestWithToken("DELETE", baseUrl, content),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }

  static Post(content: IWatchlistPostDto) {
    const baseUrl = repoWatchlist.baseUrl;

    return {
      requestFn: () => utils.requestWithToken("POST", baseUrl, content),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
