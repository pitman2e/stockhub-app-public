import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, afterEach } from "vitest";
import DateRangeSelector from "../../components/DateRangeSelector";
import "@testing-library/jest-dom/vitest";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { mockPostRequestFn } from "../setup";
import dayjs from "dayjs";

describe("DateRangeSelector", () => {
    //Prevent duplicate rendering
    afterEach(() => {
        cleanup();
    });

    const mockSetDateRange = vi.fn();

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
                        <DateRangeSelector
                            SetStateAction={mockSetDateRange}
                            DefaultPreset="-"
                            IsNullable={true} />
                    </LocalizationProvider>
                </QueryClientProvider>
            </Provider>
        );
    };

    it("basic valid date", async () => {
        const user = userEvent.setup();
        mockPostRequestFn.mockClear();

        renderComponent();

        await user.type(screen.getAllByLabelText(/^From Date$/i)[0], "20260102");
        await user.click(screen.getByRole("button", { name: /Apply/i }));
        expect(mockSetDateRange).toHaveBeenCalledWith(
            expect.objectContaining({
                fmDate: dayjs.utc('2026-01-02').unix()
            })
        );

        // For Date Picker, if input 2 in MM => auto jumps to DD; Same for DD
        await user.type(screen.getAllByLabelText(/^From Date$/i)[0], "202629");
        await user.click(screen.getByRole("button", { name: /Apply/i }));
        expect(mockSetDateRange).toHaveBeenCalledWith(
            expect.objectContaining({
                fmDate: dayjs.utc('2026-02-09').unix()
            })
        );
    });
});