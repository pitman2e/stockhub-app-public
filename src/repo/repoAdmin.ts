import utils from "../utils/utils";

export class repoAdmin {
    static readonly baseUrl = "api/Admin";

    static CrawlStockPrice_OnDemand() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/CrawlStockPrice_OnDemand`;

        return {
            requestFn: () => utils.requestWithToken('GET', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static RecalculateDivPayAdjustment() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/RecalculateDivPayAdjustment`;

        return {
            requestFn: () => utils.requestWithToken('GET', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static UpdatePositionDb() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/UpdatePositionDb`;

        return {
            requestFn: () => utils.requestWithToken('GET', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }
}