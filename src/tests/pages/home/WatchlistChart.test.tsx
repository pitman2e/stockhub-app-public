import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WatchlistChart from "../../../pages/home/WatchlistChart";

const { captureChartData, capturePlugin, chartData } = vi.hoisted(() => ({
  capturePlugin: vi.fn(),
  captureChartData: vi.fn(),
  chartData: {
    spark: {
      result: [
        {
          response: [
            {
              meta: {
                previousClose: 100,
                currentTradingPeriod: {
                  regular: { start: 1, end: 2 },
                },
              },
              timestamp: [1, 2],
              indicators: { quote: [{ close: [100, null] }] },
            },
          ],
        },
      ],
    },
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ isError: false, data: chartData }),
}));

vi.mock("@mui/material/styles", () => ({
  useTheme: () => ({
    deltaColor: { up: { color: "green" }, down: { color: "red" } },
    chartGreyLine: { color: "gray" },
  }),
}));

vi.mock("react-chartjs-2", () => ({
  Line: ({ plugins, data }: { plugins?: unknown[]; data: unknown }) => {
    capturePlugin(plugins?.[0]);
    captureChartData(data);
    return null;
  },
}));

interface ICapturedChartData {
  labels: string[];
  datasets: Array<{ data: (number | null)[] }>;
}

interface ITestChart {
  setActiveElements: (elements: never[]) => void;
  tooltip: {
    setActiveElements: (
      elements: never[],
      position: { x: number; y: number },
    ) => void;
  };
  update: () => void;
}

interface ITestEventArgs {
  event: {
    type: string;
    native?: { pointerType?: string } | null;
  };
}

interface ITestPlugin {
  beforeEvent?: (
    chart: ITestChart,
    args: ITestEventArgs,
  ) => boolean | void;
  afterEvent?: (chart: ITestChart, args: ITestEventArgs) => void;
}

const getPlugin = (): ITestPlugin => {
  const plugin = capturePlugin.mock.calls.at(-1)?.[0];
  if (typeof plugin !== "object" || plugin === null) {
    throw new Error("WatchlistChart did not register its touch plugin");
  }

  return plugin as ITestPlugin;
};

const getChartData = (): ICapturedChartData => {
  const data = captureChartData.mock.calls.at(-1)?.[0] as
    | ICapturedChartData
    | undefined;
  if (!data) {
    throw new Error("WatchlistChart did not render chart data");
  }
  return data;
};

describe("WatchlistChart touch tooltip handling", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("preserves null prices at their matching timestamps", () => {
    render(<WatchlistChart stockId="00001.HK" />);

    const chart = getChartData();
    expect(chart.labels).toHaveLength(2);
    expect(chart.datasets[0].data).toEqual([100, null]);
    expect(chart.datasets[1].data).toHaveLength(2);
  });

  it("ignores synthetic mouse movement for 500ms after touch", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T00:00:00Z"));
    render(<WatchlistChart stockId="00001.HK" />);

    const { beforeEvent } = getPlugin();
    const chart = {
      setActiveElements: vi.fn(),
      tooltip: { setActiveElements: vi.fn() },
      update: vi.fn(),
    };

    beforeEvent?.(chart, { event: { type: "touchstart", native: null } });
    expect(
      beforeEvent?.(chart, { event: { type: "mousemove", native: null } }),
    ).toBe(false);

    vi.advanceTimersByTime(500);
    expect(
      beforeEvent?.(chart, { event: { type: "mousemove", native: null } }),
    ).toBeUndefined();
  });

  it.each(["touchend", "touchcancel", "pointerup", "pointerleave", "mouseleave"])(
    "clears active chart and tooltip elements after %s",
    (type) => {
      vi.useFakeTimers();
      render(<WatchlistChart stockId="00001.HK" />);

      const { afterEvent } = getPlugin();
      const chart = {
        setActiveElements: vi.fn(),
        tooltip: { setActiveElements: vi.fn() },
        update: vi.fn(),
      };

      afterEvent?.(chart, { event: { type } });

      expect(chart.setActiveElements).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(chart.setActiveElements).toHaveBeenCalledWith([]);
      expect(chart.tooltip.setActiveElements).toHaveBeenCalledWith([], {
        x: 0,
        y: 0,
      });
      expect(chart.update).toHaveBeenCalledOnce();
    },
  );
});
