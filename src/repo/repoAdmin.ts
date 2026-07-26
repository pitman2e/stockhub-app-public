import utils from "../utils/utils";

export class repoAdmin {
    static readonly baseUrl = "api/ScheduledJobs";

    static CrawlStockPrice_Minutely() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/CrawlStockPrice_Minutely`;

        return {
            url,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static CrawlStockDividend() {
        const baseUrl = repoAdmin.baseUrl;
        const url = `${baseUrl}/CrawlStockDividend`;

        return {
            url,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }
}