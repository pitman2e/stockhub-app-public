import { describe, it } from "vitest";
import { createApiRequest } from "../../repo/apiRequest";
import { expectApiRequest } from "./expectApiRequest";

describe("createApiRequest", () => {
  it("uses GET and no body when only required arguments are provided", () => {
    expectApiRequest(createApiRequest("api/Stocks", "api/Stocks"), "api/Stocks", "api/Stocks");
  });

  it("preserves the method and body when all arguments are provided", () => {
    const body = { stockId: "00001.HK", priority: 3 };

    expectApiRequest(
      createApiRequest("api/Watchlist", "api/Watchlist", "POST", body),
      "api/Watchlist",
      "api/Watchlist",
      "POST",
      body
    );
  });
});