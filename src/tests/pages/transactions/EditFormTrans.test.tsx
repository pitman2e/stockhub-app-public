import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import EditFormTrans from "../../../pages/transactions/EditFormTrans";
import type { ITransactionGetDto } from "../../../types/api";
import { mockPostRequestFn } from "../../setup";

const mockApiQuery = vi.hoisted(() => vi.fn());

// Mock API Adapter to capture submitted form data
vi.mock("../../../adapters/apiRequestAdapter", () => ({
  default: {
    mutationOptions: vi.fn(() => ({
      requestFn: mockPostRequestFn,
      invalidateQueryKeys: [],
    })),
    query: mockApiQuery,
    queryOptions: vi.fn(() => ({
      queryKey: ["positions"],
      queryFn: vi.fn().mockResolvedValue([]),
    })),
  },
}));

describe("EditFormTrans - Cal Button Functionality", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const mockOnDialogClose = vi.fn();

  const renderComponent = (
    content: ITransactionGetDto | null = null,
    isAllowClone = false,
  ) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const mockStore = configureStore({
      reducer: { snackbar: (state = {}) => state },
    });

    return render(
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <EditFormTrans
              onDialogClose={mockOnDialogClose}
              content={content}
              defaultPortfolioId="port1"
              defaultStockId="AAPL"
              isAllowClone={isAllowClone}
            />
          </LocalizationProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  it("calculates txAmount when txCount and unitAmt are provided", async () => {
    const user = userEvent.setup();
    renderComponent();

    const countInput = screen.getByLabelText(/^Count$/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/^Price$/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/^Amount \(Ref Only\)$/i) as HTMLInputElement;

    // Enter txCount = 10 and unitAmt = 15.5
    await user.type(countInput, "10");
    await user.type(priceInput, "15.5");

    // Click "Cal" button
    await user.click(screen.getByRole("button", { name: /^Cal$/i }));

    // 1. Verify UI value
    expect(amountInput.value).toBe("155");

    // 2. Submit form to verify react-hook-form state
    await user.click(screen.getByRole("button", { name: /^Add$/i }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          txCount: 10,
          unitAmt: 15.5,
          txAmount: 155,
        })
      );
    });
  });

  it("calculates txCount when txAmount and unitAmt are provided", async () => {
    const user = userEvent.setup();
    renderComponent();

    const countInput = screen.getByLabelText(/^Count$/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/^Price$/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/^Amount \(Ref Only\)$/i) as HTMLInputElement;

    // Enter txAmount = 150 and unitAmt = 15
    await user.type(amountInput, "150");
    await user.type(priceInput, "15");

    // Click "Cal" button
    await user.click(screen.getByRole("button", { name: /^Cal$/i }));

    // 1. Verify UI value
    expect(countInput.value).toBe("10");

    // 2. Submit form to verify react-hook-form state
    await user.click(screen.getByRole("button", { name: /^Add$/i }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          txAmount: 150,
          unitAmt: 15,
          txCount: 10,
        })
      );
    });
  });

  it("calculates unitAmt when txAmount and txCount are provided", async () => {
    const user = userEvent.setup();
    renderComponent();

    const countInput = screen.getByLabelText(/^Count$/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/^Price$/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/^Amount \(Ref Only\)$/i) as HTMLInputElement;

    // Enter txAmount = 200 and txCount = 20
    await user.type(amountInput, "200");
    await user.type(countInput, "20");

    // Click "Cal" button
    await user.click(screen.getByRole("button", { name: /^Cal$/i }));

    // 1. Verify UI value
    expect(priceInput.value).toBe("10");

    // 2. Submit form to verify react-hook-form state
    await user.click(screen.getByRole("button", { name: /^Add$/i }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          txAmount: 200,
          txCount: 20,
          unitAmt: 10,
        })
      );
    });
  });

  it.each(["DIV", "REINV"] as const)(
    "asks before cloning an existing %s transaction",
    async (tranType) => {
      const user = userEvent.setup();
      const content: ITransactionGetDto = {
        iden: -1,
        version: 0,
        portfolioId: "port1",
        stockId: "AAPL",
        currency: "USD",
        txDate: "2026-09-30",
        tranType,
        unitAmt: 15.5,
        txCount: 10,
        isTransfer: false,
        handlingFee: null,
        accruedInterest: null,
        tax: null,
        ytm: null,
        comment: null,
      };
      mockApiQuery.mockResolvedValue({ totalCount: 1, tableData: [] });
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      renderComponent(content, true);

      await user.click(screen.getByRole("button", { name: /^Clone$/i }));

      const requestUrl = mockApiQuery.mock.calls[0][0].url;
      const queryParameters = new URLSearchParams(requestUrl.split("?")[1]);
      expect(queryParameters.get("portfolioId")).toBe("port1");
      expect(queryParameters.get("stockId")).toBe("AAPL");
      expect(queryParameters.get("transactionType")).toBe(tranType);
      expect(queryParameters.get("fmDate")).toBe(
        String(Date.UTC(2026, 8, 23, 12) / 1000),
      );
      expect(queryParameters.get("toDate")).toBe(
        String(Date.UTC(2026, 9, 7, 12) / 1000),
      );

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith(
          expect.stringContaining(`already exist`),
        );
      });
      expect(mockPostRequestFn).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    },
  );

  it("submits the clone after confirming a matching transaction", async () => {
    const user = userEvent.setup();
    const content: ITransactionGetDto = {
      iden: -1,
      version: 0,
      portfolioId: "port1",
      stockId: "AAPL",
      currency: "USD",
      txDate: "2026-09-30",
      tranType: "DIV",
      unitAmt: 15.5,
      txCount: 10,
      isTransfer: false,
      handlingFee: null,
      accruedInterest: null,
      tax: null,
      ytm: null,
      comment: null,
    };
    mockApiQuery.mockResolvedValue({ totalCount: 1, tableData: [] });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderComponent(content, true);

    await user.click(screen.getByRole("button", { name: /^Clone$/i }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          iden: -1,
          portfolioId: "port1",
          stockId: "AAPL",
          tranType: "DIV",
          txDate: "2026-09-30",
        }),
      );
    });
  });
});