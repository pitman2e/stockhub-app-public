import utils from "../utils/utils";

export class repoStockRealisedScrip {
    static readonly baseUrl = "api/StockRealisedScrip";

    static Put() {
        const baseUrl = repoStockRealisedScrip.baseUrl;

        return {
            requestFn: (content: any) => utils.requestWithToken('PUT', baseUrl, content),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
        };
    }
}