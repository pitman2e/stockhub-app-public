import utils from "../utils/utils";

export class repoStockRealisedScrip {
    static readonly baseUrl = "api/StockRealisedScrip";

    static Put() {
        const baseUrl = repoStockRealisedScrip.baseUrl;

        return {
            baseUrl,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
        };
    }
}