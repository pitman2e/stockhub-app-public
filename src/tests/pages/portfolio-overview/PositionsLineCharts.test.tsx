import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PositionsLineCharts } from "../../../pages/portfolio-overview/PositionsLineCharts";

const { captureCalls, chartData } = vi.hoisted(() => ({
  captureCalls: vi.fn(),
  chartData: {
    labels: ["2026-01-01", "2026-01-02"],
    unrealisedDatasets: [{ data: [100, 110], currency: "HKD" }],
    totalGainDatasets: [{ data: [10, 20], currency: "HKD" }],
    totalGainOffsetDatasets: [{ data: [10, 20], currency: "HKD" }],
    dailyGainDatasets: [{ data: [1, 2], currency: "HKD" }],
    unrealisedCostDatasets: [{ data: [90, 90], currency: "HKD" }],
    dailyRealisedDividendDatasets: [{ data: [0, 1], currency: "HKD" }],
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: chartData,
    isFetching: false,
    isSuccess: true,
    isError: false,
  }),
}));

vi.mock("@mui/material/styles", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@mui/material/styles")>();
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        primary: { main: "blue" },
        text: { primary: "black" },
      },
    }),
  };
});

vi.mock("../../../components/DateRangeSelector", () => ({
  default: () => null,
  getPresetDates: () => ({
    from: { unix: () => 1704067200 },
    to: { unix: () => 1767225600 },
  }),
}));

vi.mock("react-chartjs-2", () => ({
  Line: (props: unknown) => {
    captureCalls({ type: "Line", props });
    return null;
  },
  Bar: (props: unknown) => {
    captureCalls({ type: "Bar", props });
    return null;
  },
}));

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

interface ICapturedChartProps {
  plugins?: unknown[];
  options?: { events?: string[] };
}

const getCapturedCalls = (): { type: string; props: ICapturedChartProps }[] =>
  captureCalls.mock.calls.map((call) => call[0]);

const getFirstPlugin = (): ITestPlugin => {
  const calls = getCapturedCalls();
  const withPlugin = calls.find(
    (call) => Array.isArray(call.props.plugins) && call.props.plugins.length > 0,
  );
  const plugin = withPlugin?.props.plugins?.[0];
  if (typeof plugin !== "object" || plugin === null) {
    throw new Error("PositionsLineCharts did not register its touch plugin");
  }
  return plugin as ITestPlugin;
};

describe("PositionsLineCharts touch tooltip handling", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("registers touch-safe events including touchend on every chart", () => {
    render(<PositionsLineCharts portfolioId="IB-HKD" />);
    const calls = getCapturedCalls();
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.props.options?.events).toEqual(
        expect.arrayContaining(["touchstart", "touchend", "touchcancel"]),
      );
    }
  });

  it("registers a touch plugin on every chart", () => {
    render(<PositionsLineCharts portfolioId="IB-HKD" />);
    const calls = getCapturedCalls();
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.props.plugins?.length).toBeGreaterThan(0);
    }
  });

  it("ignores synthetic mouse movement for 500ms after touch", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T00:00:00Z"));
    render(<PositionsLineCharts portfolioId="IB-HKD" />);

    const { beforeEvent } = getFirstPlugin();
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
      render(<PositionsLineCharts portfolioId="IB-HKD" />);

      const { afterEvent } = getFirstPlugin();
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
