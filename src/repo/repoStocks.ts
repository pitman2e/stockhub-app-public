import { IStock } from "../types/db";
import { createApiRequest, getApiQueryString, getApiRoute } from "./apiRequest";

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
        const url = baseUrl + "/" + getApiRoute(portfolioId) +
            "?" + getApiQueryString({ stockId, isOrderByPosVal, assetClasses, isOpenPosOnly });

        return createApiRequest<IStock[]>(baseUrl, url);
    }

    static Post() {
        const baseUrl = repoStocks.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "POST");
    }

    static Put() {
        const baseUrl = repoStocks.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "PUT");
    }

    static Delete() {
        const baseUrl = repoStocks.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "DELETE");
    }
}
