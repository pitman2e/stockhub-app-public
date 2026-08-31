import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, afterEach } from "vitest";
import EditFormStock from "../pages/stocks/EditFormStock";
import "@testing-library/jest-dom/vitest";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const mockPostRequestFn = vi.fn().mockResolvedValue({});
const mockPutRequestFn = vi.fn().mockResolvedValue({});

// Mock the Dialog so it does not interfere with mock user input
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>(
    "@mui/material"
  );

  return {
    ...actual,
    Dialog: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("../repo/repoStocks", () => ({
  default: {
    Post: vi.fn(() => ({
      requestFn: mockPostRequestFn,
      invalidateQueryKey: ["stocks"],
    })),
    Put: vi.fn(() => ({
      requestFn: mockPutRequestFn,
      invalidateQueryKey: ["stocks"],
    })),
  },
}));

describe("EditFormStock", () => {
  //Prevent duplicate rendering
  afterEach(() => {
    cleanup();
  });

  const renderComponent = (props = {}) => {
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
            <EditFormStock onDialogClose={vi.fn()} {...props} />
          </LocalizationProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  it("prevents submission and shows Yup validation errors on empty required fields (Stock Post)", async () => {
    const user = userEvent.setup();
    mockPostRequestFn.mockClear();

    renderComponent();

    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(mockPostRequestFn).not.toHaveBeenCalled();
    expect(await screen.findByText(/stockId is a required field/i)).toBeInTheDocument();
  });

  it("transforms form data correctly and matches inferred Yup API schema on submit", async () => {
    const user = userEvent.setup();
    mockPostRequestFn.mockClear();

    renderComponent();

    await user.type(screen.getByLabelText(/ticker id/i), "AAPL");
    await user.type(screen.getByLabelText(/ticker name/i), "Apple Inc.");
    await user.selectOptions(screen.getByLabelText(/currency/i), "USD");
    await user.selectOptions(screen.getByLabelText(/asset class/i), "Stock");

    await user.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          stockId: "AAPL",
          stockName: "Apple Inc.",
          currency: "USD",
          assetClass: "STOCK",
          maturityDate: "",
          coupon: null,
          couponFreq: null,
          faceValue: null,
          key_stockId: "",
          version: -1,
        })
      );
    });
  });

  it("transforms form data correctly and matches inferred Yup API schema on submit (Bond / Post)", async () => {
    const user = userEvent.setup();
    mockPostRequestFn.mockClear();

    renderComponent();

    await user.type(screen.getByLabelText(/ticker id/i), "912345.USBND");
    await user.type(screen.getByLabelText(/ticker name/i), "US Treasury 912345");
    await user.selectOptions(screen.getByLabelText(/currency/i), "USD");
    await user.selectOptions(screen.getByLabelText(/asset class/i), "Bond");

    await user.type(screen.getAllByLabelText(/^maturity date$/i)[0], "20260102");
    await user.type(screen.getByLabelText(/^coupon$/i), "3");
    await user.type(screen.getByLabelText(/^coupon frequency$/i), "2");
    await user.type(screen.getByLabelText(/^face value$/i), "10000");

    await user.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          stockId: "912345.USBND",
          stockName: "US Treasury 912345",
          currency: "USD",
          assetClass: "BOND",
          maturityDate: "2026-01-02",
          coupon: 3,
          couponFreq: 2,
          faceValue: 10000,
          key_stockId: "",
          version: -1,
        })
      );
    });
  });
});