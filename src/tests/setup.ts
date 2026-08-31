import React from "react";
import { vi } from "vitest";

const { mockRequestFn } = vi.hoisted(() => ({
  mockRequestFn: vi.fn().mockResolvedValue({}),
}));

export const mockPostRequestFn = mockRequestFn;
export const mockPutRequestFn = mockRequestFn;

vi.mock("../adapters/apiRequestAdapter", () => ({
  default: {
    execute: mockRequestFn,
    queryOptions: vi.fn((options) => options),
    mutationOptions: vi.fn(() => mutationResult),
  },
}));

const stocks = [
  { stockId: "00001.HK", stockName: "長和", currency: "HKD", assetClass: "STOCK" },
  { stockId: "00005.HK", stockName: "匯豐控股", currency: "HKD", assetClass: "STOCK" },
  { stockId: "00006.HK", stockName: "電能實業", currency: "HKD", assetClass: "STOCK" },
  { stockId: "GOOGL.US", stockName: "Alphabet Inc.", currency: "USD", assetClass: "STOCK" },
  { stockId: "MSFT.US", stockName: "Microsoft Corporation", currency: "USD", assetClass: "STOCK" },
  { stockId: "VT.US", stockName: "Vanguard Total World Stock", currency: "USD", assetClass: "STOCK" },
  { stockId: "VWRA.LSE", stockName: "Vanguard FTSE All-World UCITS ETF", currency: "USD", assetClass: "STOCK" },
];

const portfolios = [
  { portfolioId: "IB-HKD", name: "IB (HKD)", priority: 0, defaultCurrency: "HKD", uid: "TEST_UID", isExSummary: false, isVirtual: false },
  { portfolioId: "IB-USD", name: "IB (USD)", priority: 0, defaultCurrency: "USD", uid: "TEST_UID", isExSummary: false, isVirtual: false },
];

const watchlist = stocks.slice(0, 6).map((stock, index) => ({
  stockId: stock.stockId,
  iden: index + 2,
  priority: index + 1,
  uid: "TEST_UID",
}));

const queryResult = (data: unknown) => ({
  queryKey: [],
  queryFn: vi.fn().mockResolvedValue(data),
  invalidateQueryKey: [],
});

const mutationResult = {
  requestFn: mockRequestFn,
  invalidateQueryKey: [],
  invalidateQueryKeys: [],
};

// Mock the Dialog so it does not interfere with mock user input
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>(
    "@mui/material"
  );

  return {
    ...actual,
    Dialog: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
  };
});