import { describe, it } from "vitest";
import repoDividend from "../../repo/repoDividend";
import { expectApiRequest } from "./expectApiRequest";

describe("repoDividend", () => {
  it("gets dividends with minimum parameters", () => {
    expectApiRequest(repoDividend.Get(), "api/Dividend", "api/Dividend/?");
  });

  it("gets dividends with all parameters", () => {
    expectApiRequest(repoDividend.Get({ portfolioId: "IB-HKD", stockId: "00001.HK" }), "api/Dividend", "api/Dividend/IB-HKD?stockId=00001.HK");
  });

  it("requests a dividend download with the minimum required stock ID", () => {
    expectApiRequest(repoDividend.RequestDL({ stockId: "00001.HK" }), "api/Dividend", "api/Dividend/RequestDL/00001.HK", "POST");
  });

  it("requests a dividend download with all parameters", () => {
    expectApiRequest(repoDividend.RequestDL({ stockId: "00005.HK" }), "api/Dividend", "api/Dividend/RequestDL/00005.HK", "POST");
  });

  it("builds dividend update requests", () => {
    expectApiRequest(repoDividend.Put(), "api/Dividend", "api/Dividend", "PUT");
  });
});