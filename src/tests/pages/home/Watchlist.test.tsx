import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { useMutationMock, useQueryMock } = vi.hoisted(() => ({
  useMutationMock: vi.fn<(options: unknown) => unknown>(),
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("../../../components/StockTickerLink", () => ({
  default: ({ stockId }: { stockId: string }) => <span>{stockId}</span>,
}));

vi.mock("../../../pages/home/WatchlistChart", () => ({
  default: () => null,
}));

import Watchlist from "../../../pages/home/Watchlist";

describe("Watchlist", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders a watchlisted stock when market values are unavailable", () => {
    useMutationMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    });
    useQueryMock.mockReturnValue({
      data: {
        watchlists: [
          {
            stockId: "NOPRICE.US",
            stockName: "No Price Inc.",
            price: null,
            priceChange: null,
            priceChangePercentage: null,
          },
        ],
      },
      isError: false,
      isFetching: false,
      isLoading: false,
    });

    render(<Watchlist />);

    expect(screen.getByText("No Price Inc.")).toBeTruthy();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("clears the stock id after a successful add and stays in edit mode", async () => {
    useMutationMock.mockImplementation((options: unknown) => ({
      isPending: false,
      mutate: async () => {
        const mutationOptions = options as {
          onSuccess?: (result: { invalidateQueryKey: unknown[] }) => Promise<void>;
        };
        await mutationOptions.onSuccess?.({ invalidateQueryKey: [] });
      },
      mutateAsync: vi.fn(),
    }));
    useQueryMock.mockReturnValue({
      data: { watchlists: [] },
      isError: false,
      isFetching: false,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<Watchlist />);

    await user.click(screen.getAllByRole("button")[0]);
    const stockIdInput = screen.getByRole("textbox", { name: "Stock" });
    await user.type(stockIdInput, "NOPRICE.US");
    await user.click(screen.getAllByRole("button").at(-1)!);

    await waitFor(() => {
      expect((stockIdInput as HTMLInputElement).value).toBe("");
    });
    expect(screen.getByRole("textbox", { name: "Stock" })).toBeTruthy();
  });
});