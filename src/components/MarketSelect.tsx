import React, { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { markets } from "../types/api";

interface IMarketSelectProps {
  SetStateAction: React.Dispatch<React.SetStateAction<string>>;
}

export default function MarketSelect({
  SetStateAction: MarketDispatcher,
}: IMarketSelectProps) {
  const [market, setMarket] = useState<string>("");

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
          name: "market",
          id: "market-select",
        }}
      >

        <MenuItem value="">-</MenuItem>
        {markets.map((marketOption) => (
          <MenuItem key={marketOption.value || "empty"} value={marketOption.value}>
            {marketOption.display}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
