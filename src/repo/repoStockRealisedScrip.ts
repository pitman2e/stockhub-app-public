import { createApiRequest } from "./apiRequest";

export class repoStockRealisedScrip {
    static readonly baseUrl = "api/StockRealisedScrip";

    static Put() {
        const baseUrl = repoStockRealisedScrip.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "PUT");
    }
}