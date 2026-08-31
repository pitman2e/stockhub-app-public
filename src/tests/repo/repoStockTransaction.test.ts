import { describe, it } from "vitest";
import repoStockTransaction from "../../repo/repoStockTransaction";
import { expectApiRequest } from "./expectApiRequest";

describe("repoStockTransaction", () => {
  it("gets transactions with minimum parameters", () => {
    expectApiRequest(repoStockTransaction.Get(), "api/StockTransaction", "api/StockTransaction?");
  });

  it("gets transactions with all parameters", () => {
    expectApiRequest(
      repoStockTransaction.Get({ portfolioId: "IB-USD", stockId: "VT.US", transactionType: "BUY", market: "US", fmDate: 20250601, toDate: 20260919, limit: 20, offset: 10 }),
      "api/StockTransaction",
      "api/StockTransaction?portfolioId=IB-USD&stockId=VT.US&transactionType=BUY&fmDate=20250601&toDate=20260919&market=US&limit=20&offset=10"
    );
  });

  it("builds transaction create and update requests", () => {
    expectApiRequest(repoStockTransaction.Post(), "api/StockTransaction", "api/StockTransaction", "POST");
    expectApiRequest(repoStockTransaction.Put(), "api/StockTransaction", "api/StockTransaction", "PUT");
  });

  it("deletes a transaction with the minimum required parameters", () => {
    expectApiRequest(repoStockTransaction.Delete({ portfolioId: "IB-USD", iden: -6 }), "api/StockTransaction", "api/StockTransaction?portfolioId=IB-USD", "DELETE", { iden: -6 });
  });

  it("deletes a transaction with all parameters", () => {
    expectApiRequest(repoStockTransaction.Delete({ portfolioId: "IB-HKD", iden: -1 }), "api/StockTransaction", "api/StockTransaction?portfolioId=IB-HKD", "DELETE", { iden: -1 });
  });
});