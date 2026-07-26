import utils from "../utils/utils";

export class repoScheduledJobs {
    static readonly baseUrl = "api/ScheduledJobs";

    static CrawlStockPrice_Minutely() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/CrawlStockPrice_Minutely`;

        return {
            requestFn: () => utils.requestWithToken('GET', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static CrawlStockDividend() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/CrawlStockDividend`;

        return {
            requestFn: () => utils.requestWithToken('GET', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }
}