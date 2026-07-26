import React, { useState } from 'react';
import { Grid, Button, FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with the UTC plugin to handle the GMT+0 requirement
dayjs.extend(utc);

type IDateRangeSelectorProps =
  | {
      IsNullable: true,
      SetStateAction: React.Dispatch<React.SetStateAction<{ fmDate: number | null; toDate: number | null }>>;
      DefaultPreset: string;
    }
  | {
      IsNullable: false,
      SetStateAction: React.Dispatch<React.SetStateAction<{ fmDate: number; toDate: number }>>;
      DefaultPreset: string;
    };

const presetNullableOptions = [
    { label: '-', value: '-' },
]

const presetOptions = [
    { label: 'MTD', value: 'MTD' },
    { label: 'YTD', value: 'YTD' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '2W', value: '2W' },
    { label: '1M', value: '1M' },
    { label: '2M', value: '2M' },
    { label: '3M', value: '3M' },
    { label: '4M', value: '4M' },
    { label: '6M', value: '6M' },
    { label: '12M', value: '12M' },
    { label: '2Y', value: '2Y' },
    { label: '3Y', value: '3Y' },
    { label: '5Y', value: '5Y' },
];

export function getPresetDates(preset: string) {
    const today = dayjs.utc();

    switch (preset) {
        case 'MTD':
            return { from: today.startOf('month'), to: today.endOf('day') };
        case 'YTD':
            return { from: today.startOf('year'), to: today.endOf('day') };
        case '1D':
            return { from: today.subtract(1, 'day'), to: today.endOf('day') };
        case '1W':
            return { from: today.subtract(1, 'week'), to: today.endOf('day') };
        case '2W':
            return { from: today.subtract(2, 'week'), to: today.endOf('day') };
        case '1M':
            return { from: today.subtract(1, 'month'), to: today.endOf('day') };
        case '2M':
            return { from: today.subtract(2, 'month'), to: today.endOf('day') };
        case '3M':
            return { from: today.subtract(3, 'month'), to: today.endOf('day') };
        case '4M':
            return { from: today.subtract(4, 'month'), to: today.endOf('day') };
        case '6M':
            return { from: today.subtract(6, 'month'), to: today.endOf('day') };
        case '12M':
            return { from: today.subtract(12, 'month'), to: today.endOf('day') };
        case '2Y':
            return { from: today.subtract(2, 'year'), to: today.endOf('day') };
        case '3Y':
            return { from: today.subtract(3, 'year'), to: today.endOf('day') };
        case '5Y':
            return { from: today.subtract(5, 'year'), to: today.endOf('day') };
        default:
            return { from: null, to: null };
    }
}

export default function DateRangeSelector({ SetStateAction, DefaultPreset, IsNullable }: IDateRangeSelectorProps) {
    const defaultDateRange = getPresetDates(DefaultPreset)
    const [fromDate, setFromDate] = useState<Dayjs | null | undefined>(defaultDateRange.from);
    const [toDate, setToDate] = useState<Dayjs | null | undefined>(defaultDateRange.to);
    const [selectedPreset, setSelectedPreset] = useState<string>(DefaultPreset);

    const publishDateRange = (fmDate: number | null, toDateValue: number | null) => {
        SetStateAction({ fmDate: fmDate!, toDate: toDateValue! });
    };

    const handleApply = () => {
        // Convert to GMT+0 Unix timestamp (seconds), or null if invalid
        const fmDateNum = fromDate?.isValid()
            ? dayjs.utc(fromDate.format('YYYY-MM-DD'), 'YYYY-MM-DD').startOf('day').unix()
            : null;

        const toDateNum = toDate?.isValid()
            ? dayjs.utc(toDate.format('YYYY-MM-DD'), 'YYYY-MM-DD').endOf('day').unix()
            : null;

        if (IsNullable || (!!fmDateNum && !!toDateNum)) {
            publishDateRange(fmDateNum, toDateNum);
        }
    };

    const handleClear = () => {
        changePreset(DefaultPreset);
    };

    const handlePresetSelectorChange = (event: SelectChangeEvent<string>) => {
        changePreset(event.target.value);
    }

    const changePreset = (preset: string) => {
        setSelectedPreset(preset);

        if (!IsNullable && preset === "-") {
            changePreset(DefaultPreset);
            return;
        }

        const range = getPresetDates(preset);
        const from = range.from?.startOf('day');
        const to = range.to?.endOf('day');
        setFromDate(from);
        setToDate(to);
        publishDateRange(from?.unix() ?? null, to?.unix() ?? null);
    };

    const handleFromDateChange = (date: Dayjs | null | undefined) => {
        setFromDate(date);
    };

    const handleToDateChange = (date: Dayjs | null | undefined) => {
        setToDate(date);
    };

    return (
        <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker key={fromDate?.isValid() ? fromDate.toISOString() : ""}
                    label="From Date"
                    format="YYYY-MM-DD"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    slotProps={{
                        textField: { fullWidth: true }
                    }}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker key={toDate?.isValid() ? toDate.toISOString() : ""}
                    label="To Date"
                    format="YYYY-MM-DD"
                    value={toDate}
                    onChange={handleToDateChange}
                    slotProps={{
                        textField: { fullWidth: true }
                    }}
                />
            </Grid>

            <Grid size={{ xs: 6, sm: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApply}
                    fullWidth
                    sx={{ height: '56px' }}
                >
                    Apply
                </Button>
            </Grid>

            <Grid size={{ xs: 6, sm: 2 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClear}
                    fullWidth
                    sx={{ height: '56px' }} // Aligns with the default MUI TextField height
                >
                    Clear
                </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
                <FormControl fullWidth>
                    <InputLabel id="date-range-preset-label">Preset</InputLabel>
                    <Select
                        labelId="date-range-preset-label"
                        label="Preset"
                        value={selectedPreset}
                        onChange={handlePresetSelectorChange}
                    >
                        {IsNullable && presetNullableOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}

                        {presetOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
}