import { createApiRequest } from "./apiRequest";

export class repoScheduledJobs {
    static readonly baseUrl = "api/ScheduledJobs";

    static CrawlStockPrice_Minutely() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/CrawlStockPrice_Minutely`;

        return createApiRequest(baseUrl, url, "GET");
    }

    static CrawlStockDividend() {
        const baseUrl = repoScheduledJobs.baseUrl;
        const url = `${baseUrl}/CrawlStockDividend`;

        return createApiRequest(baseUrl, url, "GET");
    }
}