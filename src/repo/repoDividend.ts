import { IStockDividend } from "../types/db";
import utils from "../utils/utils";

export default class repoDividend {
  static readonly baseUrl = "api/Dividend";

  static Get(
    {
      portfolioId,
      stockId,
    }: {
      portfolioId?: string | null;
      stockId?: string | null;
    } = {}
  ) {
    const baseUrl = repoDividend.baseUrl;
    const url = baseUrl + "/" + utils.getQueryRoute(portfolioId) + "?" + utils.getQueryStringFromDict({ stockId });

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, portfolioId, stockId }),
      queryFn: utils.getReactQueryFn<IStockDividend[]>(url),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }

  static RequestDL(
    {
      stockId,
    }: {
      stockId: string;
    }
  ) {
    const baseUrl = repoDividend.baseUrl + "/RequestDL";
    const url = baseUrl + "/" + utils.getQueryRoute(stockId);

    return {
      requestFn: () => utils.requestWithToken('POST', url),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
    }
  }

  static Put() {
    const baseUrl = repoDividend.baseUrl;

    return {
      requestFn: (content: any) => utils.requestWithToken('PUT', baseUrl, content),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
