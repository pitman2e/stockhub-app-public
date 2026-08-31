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
import { mockPostRequestFn } from "../../setup";

// Mock API Adapter to capture submitted form data
vi.mock("../../adapters/apiRequestAdapter", () => ({
  default: {
    mutationOptions: vi.fn(() => ({
      requestFn: mockPostRequestFn,
      invalidateQueryKeys: [],
    })),
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
  });

  const mockOnDialogClose = vi.fn();

  const renderComponent = () => {
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
              content={null}
              defaultPortfolioId="port1"
              defaultStockId="AAPL"
              isAllowClone={false}
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
});