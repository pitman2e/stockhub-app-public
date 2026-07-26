import React, { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { txTypes } from '../types/api';

interface ITransactionTypeSelectProps {
    SetStateAction: React.Dispatch<React.SetStateAction<string>>;
}

export default function TransactionTypeSelect({ SetStateAction: TransactionTypeDispatcher }: ITransactionTypeSelectProps) {
    const [transactionType, setTransactionType] = useState<string>('');

    const handleChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        setTransactionType(newValue);
        TransactionTypeDispatcher(newValue);
    };

    return (
        <FormControl fullWidth={true}>
            <InputLabel id="filter-transactionType">Type</InputLabel>
            <Select
                labelId="filter-transactionType"
                label="Type"
                value={transactionType}
                onChange={handleChange}
                inputProps={{
                    name: 'transactionType',
                    id: 'transactionType-select',
                }}
            >
                <MenuItem aria-label="None" value="">-</MenuItem>
                {
                    txTypes.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                            {t.display}
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    );
}