import { describe, it } from "vitest";
import repoWatchlist from "../../repo/repoWatchlist";
import { expectApiRequest } from "./expectApiRequest";

describe("repoWatchlist", () => {
  it("gets watchlist data with minimum parameters", () => {
    expectApiRequest(repoWatchlist.Get({}), "api/Watchlist", "api/Watchlist?");
  });

  it("gets watchlist data with all parameters", () => {
    expectApiRequest(repoWatchlist.Get({ topCnt: 5 }), "api/Watchlist", "api/Watchlist?topCnt=5");
  });

  it("deletes a watchlist stock with the minimum required payload", () => {
    expectApiRequest(repoWatchlist.Delete({ stockId: "00001.HK" }), "api/Watchlist", "api/Watchlist", "DELETE", { stockId: "00001.HK" });
  });

  it("deletes a watchlist stock with all parameters", () => {
    expectApiRequest(repoWatchlist.Delete({ stockId: "VT.US" }), "api/Watchlist", "api/Watchlist", "DELETE", { stockId: "VT.US" });
  });

  it("adds a watchlist stock with the minimum required payload", () => {
    expectApiRequest(repoWatchlist.Post({ stockId: "00001.HK", priority: 3 }), "api/Watchlist", "api/Watchlist", "POST", { stockId: "00001.HK", priority: 3 });
  });

  it("adds a watchlist stock with all parameters", () => {
    expectApiRequest(repoWatchlist.Post({ stockId: "VT.US", priority: 1 }), "api/Watchlist", "api/Watchlist", "POST", { stockId: "VT.US", priority: 1 });
  });
});