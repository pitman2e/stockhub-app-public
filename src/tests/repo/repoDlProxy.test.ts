import { describe, it } from "vitest";
import { repoDlProxy } from "../../repo/repoDlProxy";
import { expectApiRequest } from "./expectApiRequest";

describe("repoDlProxy", () => {
  it("gets Yahoo chart data with minimum parameters", () => {
    expectApiRequest(repoDlProxy.Get({}), "api/DlProxy/YahooChart", "api/DlProxy/YahooChart?");
  });

  it("gets Yahoo chart data with all parameters", () => {
    expectApiRequest(repoDlProxy.Get({ stockId: "00001.HK" }), "api/DlProxy/YahooChart", "api/DlProxy/YahooChart?stockId=00001.HK");
  });
});