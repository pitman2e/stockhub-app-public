import { IStock } from "../types/db";
import utils from "../utils/utils";

export default class repoStocks {
    static readonly baseUrl = "api/Stocks";

    static Get({ portfolioId, stockId, isOpenPosOnly, isOrderByPosVal, assetClasses }:
        {
            portfolioId?: string | null;
            stockId?: string | null;
            isOpenPosOnly?: boolean | null;
            isOrderByPosVal?: boolean | null;
            assetClasses?: string | null
        } = {}
    ) {
        const baseUrl = repoStocks.baseUrl;
        const url = baseUrl + "/" + utils.getQueryRoute(portfolioId) +
            "?" + utils.getQueryStringFromDict({ stockId, isOrderByPosVal, assetClasses, isOpenPosOnly });

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl, portfolioId, stockId, isOpenPosOnly, isOrderByPosVal, assetClasses }),
            queryFn: utils.getReactQueryFn<IStock[]>(url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
        };
    }

    static Delete(
        {
            stockId,
        }: {
            stockId: string;
        }
    ) {
        const baseUrl = repoStocks.baseUrl;
        const url = baseUrl + "/" + utils.getQueryRoute(stockId);
        return {
            response: utils.requestWithToken('DELETE', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
        };
    }
}
