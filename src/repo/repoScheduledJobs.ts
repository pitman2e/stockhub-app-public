import utils from "../utils/utils";

export class repoScheduledJobs {
    static readonly baseUrl = "api/Admin";

    static CrawlStockPrice_OnDemand() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/CrawlStockPrice_OnDemand`;

        return {
            url,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static RecalculateDivPayAdjustment() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/RecalculateDivPayAdjustment`;

        return {
            url,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static UpdatePositionDb() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/UpdatePositionDb`;

        return {
            url,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }
}