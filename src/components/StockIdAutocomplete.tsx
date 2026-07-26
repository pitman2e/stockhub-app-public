import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import repoStocks from '../repo/repoStocks';
import { IStock } from '../types/db';
import { useQuery } from '@tanstack/react-query';

export interface IStockIdAutocompleteProps {
  SetStateAction?: React.Dispatch<React.SetStateAction<string>>;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: {
      stockId: string;
      stockName: string;
    } | null
  ) => void;
  portfolioId?: string;
  stockId?: string;
  isOpenPosOnly?: boolean;
  isOrderByPosVal?: boolean;
}

export default function StockIdAutocomplete({ SetStateAction: StockDispatcher, onChange, portfolioId, stockId, isOpenPosOnly = false, isOrderByPosVal = true }: IStockIdAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useQuery(repoStocks.Get({ portfolioId, isOpenPosOnly, isOrderByPosVal }));

  return (
    <Autocomplete
      id="dropdown-stock-id"
      sx={{ minWidth: 300 }}
      defaultValue={stockId ? { stockId: stockId, stockName: "" } as IStock : undefined}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionLabel={(option) => option.stockId + (option.stockName ? " - " : "") + option.stockName}
      options={data ?? []}
      loading={isLoading}
      onChange={(event, value) => {
        if (StockDispatcher) {
          StockDispatcher(value ? value.stockId : "");
        }
        if (onChange) {
          onChange(event, value);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Ticker Name"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <React.Fragment>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.slotProps.input.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
    />
  );
}