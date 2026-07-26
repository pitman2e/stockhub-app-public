import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

const assetClassesChoices = [
  'STOCK',
  'BOND',
  'MANUAL',
] as const; 

interface IAssetClassSelectProps {
  onChange: (stringifiedValue: string[]) => void;
  defaultValues: string[];
}

export default function AssetClassSelect({ onChange, defaultValues }: IAssetClassSelectProps) {
  const [assetClasses, setAssetClasses] = React.useState(defaultValues);

  const handleChange = (event: SelectChangeEvent<string[]>, _child?: React.ReactNode) => {
    const {
      target: { value },
    } = event;

    const stringifiedValue = typeof value === 'string' ? value.split(',') : value
    setAssetClasses(
      // On autofill we get a stringified value.
      stringifiedValue,
    );

    if (onChange) {
      onChange(stringifiedValue);
    };
  };

  return (
    <FormControl fullWidth={true}>
      <InputLabel id="asset-classes-select">Asset Classes</InputLabel>
      <Select
        labelId="asset-classes-select"
        id="asset-classes-select"
        multiple
        value={assetClasses}
        onChange={handleChange}
        input={<OutlinedInput label="Asset Classes" />}
        renderValue={(selected) => selected.join(', ')}
      >
        {assetClassesChoices.map((assetCls) => (
          <MenuItem key={assetCls} value={assetCls}>
            <Checkbox checked={assetClasses.includes(assetCls)} />
            <ListItemText primary={assetCls} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}


