import { describe, it } from "vitest";
import repoTags from "../../repo/repoTags";
import { expectApiRequest } from "./expectApiRequest";

describe("repoTags", () => {
  it("gets tags with minimum parameters", () => {
    expectApiRequest(repoTags.Get(), "api/Tags", "api/Tags/");
  });

  it("gets tags with all parameters", () => {
    expectApiRequest(repoTags.Get({ category: "STOCK" }), "api/Tags", "api/Tags/STOCK");
  });

  it("gets portfolio pie data with minimum parameters", () => {
    expectApiRequest(repoTags.GetPortfolioPie({}), "api/Tags", "api/Tags/Pie/?");
  });

  it("gets portfolio pie data with all parameters", () => {
    expectApiRequest(repoTags.GetPortfolioPie({ portfolioId: "IB-HKD", tag: "Income", assetClass: "STOCK" }), "api/Tags", "api/Tags/Pie/IB-HKD?tag=Income&assetClass=STOCK");
  });

  it("builds tag create requests", () => {
    expectApiRequest(repoTags.Post(), "api/Tags", "api/Tags", "POST");
  });
});