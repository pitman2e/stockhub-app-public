import React, { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

interface IMarketSelectProps {
    SetStateAction: React.Dispatch<React.SetStateAction<string>>;
}

export default function MarketSelect({ SetStateAction: MarketDispatcher }: IMarketSelectProps) {
    const [market, setMarket] = useState<string>('');

    const handleChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        setMarket(newValue);
        MarketDispatcher(newValue);
    };

    return (
        <FormControl fullWidth={true}>
            <InputLabel id="filter-market">Market</InputLabel>
            <Select
                labelId="filter-market"
                label="Market"
                value={market}
                onChange={handleChange}
                inputProps={{
                    name: 'market',
                    id: 'market-select',
                }}
            >
                <MenuItem value="">-</MenuItem>
                <MenuItem value={"US"}>US</MenuItem>
                <MenuItem value={"LSE"}>LSE</MenuItem>
                <MenuItem value={"USBND"}>USBND</MenuItem>
                <MenuItem value={"CASH"}>CASH</MenuItem>
                <MenuItem value={"HKBND"}>HKBND</MenuItem>
                <MenuItem value={"HK"}>HK</MenuItem>
                <MenuItem value={"PCP"}>PCP</MenuItem>
                <MenuItem value={"HSBC"}>HSBC</MenuItem>
                <MenuItem value={"MANU"}>MANU</MenuItem>
            </Select>
        </FormControl>
    );
}