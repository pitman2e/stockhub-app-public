import { describe, it } from "vitest";
import repoStocks from "../../repo/repoStocks";
import { expectApiRequest } from "./expectApiRequest";

describe("repoStocks", () => {
  it("gets stocks with minimum parameters", () => {
    expectApiRequest(repoStocks.Get(), "api/Stocks", "api/Stocks/?");
  });

  it("gets stocks with all parameters", () => {
    expectApiRequest(
      repoStocks.Get({ portfolioId: "IB-HKD", stockId: "00001.HK", isOpenPosOnly: true, isOrderByPosVal: false, assetClasses: "STOCK" }),
      "api/Stocks",
      "api/Stocks/IB-HKD?stockId=00001.HK&isOrderByPosVal=false&assetClasses=STOCK&isOpenPosOnly=true"
    );
  });

  it("builds stock create, update, and delete requests", () => {
    expectApiRequest(repoStocks.Post(), "api/Stocks", "api/Stocks", "POST");
    expectApiRequest(repoStocks.Put(), "api/Stocks", "api/Stocks", "PUT");
    expectApiRequest(repoStocks.Delete(), "api/Stocks", "api/Stocks", "DELETE");
  });
});