import { describe, it } from "vitest";
import { repoAdmin } from "../../repo/repoAdmin";
import { expectApiRequest } from "./expectApiRequest";

describe("repoAdmin", () => {
  it("builds admin requests", () => {
    expectApiRequest(repoAdmin.CrawlStockPrice_OnDemand(), "api/Admin", "api/Admin/CrawlStockPrice_OnDemand");
    expectApiRequest(repoAdmin.RecalculateDivPayAdjustment(), "api/Admin", "api/Admin/RecalculateDivPayAdjustment");
    expectApiRequest(repoAdmin.UpdatePositionDb(), "api/Admin", "api/Admin/UpdatePositionDb");
  });
});