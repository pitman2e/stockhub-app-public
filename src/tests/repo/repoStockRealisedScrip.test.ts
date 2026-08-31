import { describe, it } from "vitest";
import { repoStockRealisedScrip } from "../../repo/repoStockRealisedScrip";
import { expectApiRequest } from "./expectApiRequest";

describe("repoStockRealisedScrip", () => {
  it("builds realised scrip update requests", () => {
    expectApiRequest(repoStockRealisedScrip.Put(), "api/StockRealisedScrip", "api/StockRealisedScrip", "PUT");
  });
});