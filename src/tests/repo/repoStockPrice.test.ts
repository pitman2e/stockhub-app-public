import { describe, it } from "vitest";
import repoStockPrice from "../../repo/repoStockPrice";
import { expectApiRequest } from "./expectApiRequest";

describe("repoStockPrice", () => {
  it("gets top movers with minimum parameters", () => {
    expectApiRequest(repoStockPrice.GetTopMovers({}), "api/StockPrice", "api/StockPrice/TopMoving?");
  });

  it("gets top movers with all parameters", () => {
    expectApiRequest(repoStockPrice.GetTopMovers({ topCnt: 5 }), "api/StockPrice", "api/StockPrice/TopMoving?topCnt=5");
  });

  it("gets stock price charts with minimum parameters", () => {
    expectApiRequest(repoStockPrice.GetStockPricesChart(), "api/StockPrice", "api/StockPrice/StockPricesChart?");
  });

  it("gets stock price charts with all parameters", () => {
    expectApiRequest(
      repoStockPrice.GetStockPricesChart({ stockId: "00001.HK", fmDate: 20260601, toDate: 20260919, assetClasses: "STOCK" }),
      "api/StockPrice",
      "api/StockPrice/StockPricesChart?stockId=00001.HK&fmDate=20260601&toDate=20260919&assetClasses=STOCK"
    );
  });

  it("gets performance with minimum parameters", () => {
    expectApiRequest(repoStockPrice.GetPerformance({}), "api/StockPrice", "api/StockPrice/Performance?");
  });

  it("gets performance with all parameters", () => {
    expectApiRequest(repoStockPrice.GetPerformance({ stockId: "00001.HK" }), "api/StockPrice", "api/StockPrice/Performance?stockId=00001.HK");
  });
});