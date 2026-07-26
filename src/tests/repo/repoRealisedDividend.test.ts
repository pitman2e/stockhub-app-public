import { describe, it } from "vitest";
import repoRealisedDividend from "../../repo/repoRealisedDividend";
import { expectApiRequest } from "./expectApiRequest";

describe("repoRealisedDividend", () => {
  it("gets realised dividends with minimum parameters", () => {
    expectApiRequest(repoRealisedDividend.Get(), "api/RealisedDividend", "api/RealisedDividend/?");
  });

  it("gets realised dividends with all parameters", () => {
    expectApiRequest(repoRealisedDividend.Get({ portfolioId: "IB-HKD", stockId: "00001.HK", market: "HK" }), "api/RealisedDividend", "api/RealisedDividend/IB-HKD?stockId=00001.HK&market=HK");
  });

  it("gets monthly chart data with minimum parameters", () => {
    expectApiRequest(repoRealisedDividend.GetMonthlyChart({}), "api/RealisedDividend", "api/RealisedDividend/MonthlyChart?");
  });

  it("gets monthly chart data with all parameters", () => {
    expectApiRequest(repoRealisedDividend.GetMonthlyChart({ portfolioId: "IB-HKD", stockId: "00001.HK" }), "api/RealisedDividend", "api/RealisedDividend/MonthlyChart?portfolioId=IB-HKD&stockId=00001.HK");
  });
});