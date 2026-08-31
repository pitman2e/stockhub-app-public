import { createApiRequest } from "./apiRequest";

export class repoAdmin {
    static readonly baseUrl = "api/Admin";

    static CrawlStockPrice_OnDemand() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/CrawlStockPrice_OnDemand`;

            return createApiRequest(baseUrl, url, "GET");
    }

    static RecalculateDivPayAdjustment() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/RecalculateDivPayAdjustment`;

        return createApiRequest(baseUrl, url, "GET");
    }

    static UpdatePositionDb() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/UpdatePositionDb`;

        return createApiRequest(baseUrl, url, "GET");
    }
}