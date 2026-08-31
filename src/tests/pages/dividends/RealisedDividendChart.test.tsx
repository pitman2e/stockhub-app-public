import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RealisedDividendChart from "../../../pages/dividends/RealisedDividendChart";

const { captureProps, chartData } = vi.hoisted(() => ({
  captureProps: vi.fn(),
  chartData: {
    labels: ["2026-01", "2026-02"],
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

vi.mock("react-chartjs-2", () => ({
  Bar: (props: unknown) => {
    captureProps(props);
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

interface ICapturedProps {
  plugins?: unknown[];
  options?: { events?: string[] };
}

const renderOpenChart = () => {
  render(<RealisedDividendChart stockId="00001.HK" />);
  fireEvent.click(screen.getByText("Realised Dividends Summary"));
};

const getCaptured = (): ICapturedProps => {
  const props = captureProps.mock.calls.at(-1)?.[0] as
    | ICapturedProps
    | undefined;
  if (!props) {
    throw new Error("RealisedDividendChart did not render Bar");
  }
  return props;
};

const getPlugin = (): ITestPlugin => {
  const plugin = getCaptured().plugins?.[0];
  if (typeof plugin !== "object" || plugin === null) {
    throw new Error("RealisedDividendChart did not register its touch plugin");
  }
  return plugin as ITestPlugin;
};

describe("RealisedDividendChart touch tooltip handling", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("registers touch-safe events including touchend", () => {
    renderOpenChart();
    const { events } = getCaptured().options ?? {};
    expect(events).toEqual(
      expect.arrayContaining(["touchstart", "touchend", "touchcancel"]),
    );
  });

  it("ignores synthetic mouse movement for 500ms after touch", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T00:00:00Z"));
    renderOpenChart();

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
      renderOpenChart();

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
