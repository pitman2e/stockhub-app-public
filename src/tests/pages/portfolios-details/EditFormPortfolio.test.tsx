import { createElement, type ComponentProps } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import EditFormPortfolio from "../../../pages/portfolios-details/EditFormPortfolio";
import type { IStockSummary } from "../../../types/api";
import type { IStockPortfolio } from "../../../types/db";
import { mockPostRequestFn } from "../../setup";

const mockOnDialogClose = vi.fn();

function createSummary(isVirtual: boolean): IStockSummary {
  return {
    portfolio: {
      portfolioId: isVirtual ? "VP" : "IB",
      name: isVirtual ? "Virtual Portfolio" : "IB",
      priority: isVirtual ? 5 : 0,
      defaultCurrency: "HKD",
      isExcludedFromSummary: false,
      isVirtual,
      version: 2474,
    },
    childPortfolioIds: isVirtual ? ["IB"] : [],
    marketDate: "2026-01-01",
    totalCost: 0,
    totalDividend: 0,
    totalRealisedAmount: 0,
    totalUnrealisedGainPercentage: 0,
    totalUnrealisedGain: 0,
    curTxGainAmount: 0,
    curTxGainAmountLatest: 0,
    curTxGainAmountPercentage: 0,
    curTxGainAmountLatestPercentage: 0,
    totalRealisedGain: 0,
    totalUnrealisedAmount: 0,
    displayCurrency: "HKD",
    totalGain: 0,
    totalGainPercentage: 0,
    totalRealisedGainPercentage: null,
    totalYtdGain: 0,
    totalYtdGainPercentage: 0,
    totalUnrealisedAmountPrev: 0,
    totalUnrealisedCost: 0,
    totalRealisedCost: 0,
  };
}

function renderForm(data: IStockSummary | null) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const store = configureStore({
    reducer: { snackbar: (state = {}) => state },
  });

  return render(
    createElement(
      Provider,
      { store } as ComponentProps<typeof Provider>,
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(EditFormPortfolio, {
          data,
          availablePortfolios: [
            {
              portfolioId: "IB",
              name: "Interactive Brokers HKD",
              defaultCurrency: "HKD",
              priority: 0,
              isExcludedFromSummary: false,
              isVirtual: false,
              version: 1,
            },
            {
              portfolioId: "IB-USD",
              name: "Interactive Brokers USD",
              defaultCurrency: "USD",
              priority: 1,
              isExcludedFromSummary: false,
              isVirtual: false,
              version: 1,
            },
          ] as IStockPortfolio[],
          onDialogClose: mockOnDialogClose,
        }),
      ),
    ),
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditFormPortfolio", () => {
  it("shows and submits Add values with Is Virtual unchecked", async () => {
    const user = userEvent.setup();
    renderForm(null);

    const portfolioId = screen.getByRole("textbox", { name: "Portfolio Id" });
    const portfolioName = screen.getByRole("textbox", { name: "Portfolio Name" });
    const currency = screen.getByRole("combobox", { name: "Default Currency" });
    const priority = screen.getByRole("textbox", { name: "Sort Sequence" });
    const isVirtual = screen.getByRole("checkbox", { name: "Is Virtual?" });

    expect(portfolioId).toHaveValue("");
    expect(portfolioName).toHaveValue("");
    expect(currency).toHaveValue("");
    expect(priority).toHaveValue("0");
    expect(isVirtual).not.toBeChecked();

    await user.type(portfolioId, "New Portfolio");
    await user.type(portfolioName, "New Portfolio Name");
    await user.selectOptions(currency, "USD");
    await user.clear(priority);
    await user.type(priority, "5");

    expect(portfolioId).toHaveValue("New Portfolio");
    expect(portfolioName).toHaveValue("New Portfolio Name");
    expect(currency).toHaveValue("USD");
    expect(priority).toHaveValue("5");
    expect(isVirtual).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith({
        portfolioId: "New Portfolio",
        portfolioName: "New Portfolio Name",
        defaultCurrency: "USD",
        priority: 5,
        isVirtual: false,
        version: -1,
        childPortfolioIds: [],
      });
    });
  });

  it("shows and submits Add values with Is Virtual checked", async () => {
    const user = userEvent.setup();
    renderForm(null);

    const portfolioId = screen.getByRole("textbox", { name: "Portfolio Id" });
    const portfolioName = screen.getByRole("textbox", { name: "Portfolio Name" });
    const currency = screen.getByRole("combobox", { name: "Default Currency" });
    const priority = screen.getByRole("textbox", { name: "Sort Sequence" });
    const isVirtual = screen.getByRole("checkbox", { name: "Is Virtual?" });

    await user.type(portfolioId, "NewVP");
    await user.type(portfolioName, "New Virtual Portfolio");
    await user.selectOptions(currency, "HKD");
    await user.clear(priority);
    await user.type(priority, "5");
    await user.click(isVirtual);

    expect(portfolioId).toHaveValue("NewVP");
    expect(portfolioName).toHaveValue("New Virtual Portfolio");
    expect(currency).toHaveValue("HKD");
    expect(priority).toHaveValue("5");
    expect(isVirtual).toBeChecked();
    await user.selectOptions(screen.getByRole("combobox", { name: "Add Portfolio" }), "IB");
    expect(screen.getByText("Interactive Brokers HKD")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith({
        portfolioId: "NewVP",
        portfolioName: "New Virtual Portfolio",
        defaultCurrency: "HKD",
        priority: 5,
        isVirtual: true,
        version: -1,
        childPortfolioIds: ["IB"],
      });
    });
  });

  it("shows and submits Edit values with Is Virtual unchecked", async () => {
    const user = userEvent.setup();
    const data = createSummary(false);
    renderForm(data);

    expect(screen.getByRole("heading", { name: "Edit Portfolio" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Portfolio Id" })).toHaveValue("IB");
    expect(screen.getByRole("textbox", { name: "Portfolio Name" })).toHaveValue("IB");
    expect(screen.getByRole("combobox", { name: "Default Currency" })).toHaveValue("HKD");
    expect(screen.getByRole("textbox", { name: "Sort Sequence" })).toHaveValue("0");
    expect(screen.getByRole("checkbox", { name: "Is Virtual?" })).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith({
        portfolioId: "IB",
        portfolioName: "IB",
        defaultCurrency: "HKD",
        priority: 0,
        isVirtual: false,
        version: 2474,
        childPortfolioIds: [],
      });
    });
  });

  it("shows and submits Edit values with Is Virtual checked", async () => {
    const user = userEvent.setup();
    const data = createSummary(true);
    renderForm(data);

    expect(screen.getByRole("heading", { name: "Edit Portfolio" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Portfolio Id" })).toHaveValue("VP");
    expect(screen.getByRole("textbox", { name: "Portfolio Name" })).toHaveValue("Virtual Portfolio");
    expect(screen.getByRole("combobox", { name: "Default Currency" })).toHaveValue("HKD");
    expect(screen.getByRole("textbox", { name: "Sort Sequence" })).toHaveValue("5");
    expect(screen.getByRole("checkbox", { name: "Is Virtual?" })).toBeChecked();
    expect(screen.getByText("Interactive Brokers HKD")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith({
        portfolioId: "VP",
        portfolioName: "Virtual Portfolio",
        defaultCurrency: "HKD",
        priority: 5,
        isVirtual: true,
        version: 2474,
        childPortfolioIds: ["IB"],
      });
    });
  });

  it("removes a mapped portfolio from the proposed edit list", async () => {
    const user = userEvent.setup();
    renderForm(createSummary(true));

    screen.getByRole("button", { name: "Interactive Brokers HKD" }).focus();
    await user.keyboard("{Backspace}");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(mockPostRequestFn).toHaveBeenCalledWith(expect.objectContaining({
        portfolioId: "VP",
        childPortfolioIds: [],
      }));
    });
  });
});
