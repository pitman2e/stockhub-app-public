import { IStockMovements } from "../types/api";
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
}
