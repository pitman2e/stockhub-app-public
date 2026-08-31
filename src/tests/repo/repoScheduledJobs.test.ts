import { describe, it } from "vitest";
import { repoScheduledJobs } from "../../repo/repoScheduledJobs";
import { expectApiRequest } from "./expectApiRequest";

describe("repoScheduledJobs", () => {
  it("builds scheduled job requests", () => {
    expectApiRequest(repoScheduledJobs.CrawlStockPrice_Minutely(), "api/ScheduledJobs", "api/ScheduledJobs/CrawlStockPrice_Minutely");
    expectApiRequest(repoScheduledJobs.CrawlStockDividend(), "api/ScheduledJobs", "api/ScheduledJobs/CrawlStockDividend");
  });
});