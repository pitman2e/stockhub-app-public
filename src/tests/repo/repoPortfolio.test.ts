import { describe, it } from "vitest";
import repoPortfolio from "../../repo/repoPortfolio";
import { expectApiRequest } from "./expectApiRequest";

describe("repoPortfolio", () => {
  it("builds portfolio create, update, and list requests", () => {
    expectApiRequest(repoPortfolio.Post(), "api/Portfolio", "api/Portfolio", "POST");
    expectApiRequest(repoPortfolio.Put(), "api/Portfolio", "api/Portfolio", "PUT");
    expectApiRequest(repoPortfolio.Get(), "api/Portfolio", "api/Portfolio");
  });

  it("deletes a portfolio with the minimum required parameter", () => {
    expectApiRequest(repoPortfolio.Delete({ portfolioId: "IB-HKD" }), "api/Portfolio", "api/Portfolio/IB-HKD", "DELETE");
  });

  it("deletes a portfolio with all parameters", () => {
    expectApiRequest(repoPortfolio.Delete({ portfolioId: "IB-USD" }), "api/Portfolio", "api/Portfolio/IB-USD", "DELETE");
  });

  it("gets portfolio summaries with minimum parameters", () => {
    expectApiRequest(repoPortfolio.GetSummary(), "api/Portfolio", "api/Portfolio/Summary/?");
  });

  it("gets portfolio summaries with all parameters", () => {
    expectApiRequest(repoPortfolio.GetSummary({ portfolioId: "IB-USD", currency: "USD" }), "api/Portfolio", "api/Portfolio/Summary/IB-USD?displayCurrency=USD");
  });

  it("gets positions with minimum parameters", () => {
    expectApiRequest(repoPortfolio.GetPositions(), "api/Portfolio", "api/Portfolio/Positions/?");
  });

  it("gets positions with all parameters", () => {
    expectApiRequest(
      repoPortfolio.GetPositions({ portfolioId: "IB-HKD", posStatus: "OPEN", sortBy: "positionValue", isDesc: true }),
      "api/Portfolio",
      "api/Portfolio/Positions/IB-HKD?posStatus=OPEN&sortBy=positionValue&isDesc=true"
    );
  });

  it("gets position charts with minimum required parameters", () => {
    expectApiRequest(repoPortfolio.GetPositionChart({ fmDate: 20260901, toDate: 20260919 }), "api/Portfolio", "api/Portfolio/PositionChart?fmDate=20260901&toDate=20260919");
  });

  it("gets position charts with all parameters", () => {
    expectApiRequest(
      repoPortfolio.GetPositionChart({ portfolioId: "IB-HKD", stockId: "00001.HK", dayRes: 1, fmDate: 20260901, toDate: 20260919 }),
      "api/Portfolio",
      "api/Portfolio/PositionChart?portfolioId=IB-HKD&stockId=00001.HK&dayRes=1&fmDate=20260901&toDate=20260919"
    );
  });
});