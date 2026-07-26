import React from 'react';
import { PaletteMode, ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { green, grey } from '@mui/material/colors';
import App from './App';
import typography from '../ui/typography';
//import {defaults as chartDefaults,} from 'chart.js';
import themeColor from '../ui/themeColor';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Context as ColorModeContext } from '../hooks/useColorMode'

export default function ThemedApp() {
  const lsMode = localStorage.getItem("mode") as PaletteMode;
  const [mode, setMode] = React.useState(lsMode === null ? "light" : lsMode);
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem("mode", newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        typography: typography(),
        palette: {
          mode,
          primary: themeColor.primary,
        },
        deltaColor: {
          up: {
            color: (mode === 'dark' ? "#86F00C" : green["800"]),
          },
          down: {
            color: (mode === 'dark' ? '#FF8F8F' : '#FF0000'),
          },
        },
        chartGreyLine: {
          color: (mode === 'dark' ? grey["200"] : grey["600"]),
        },
        gridItemHover: {
          color: (mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)")
        },
        components: {
          MuiTableCell: { // Name of the component
            styleOverrides: {
              root: { // Name of the slot
                // Some CSS
                whiteSpace: 'nowrap',
              },
            },
          },
        }
      }),
    [mode],
  );

  //React ChartJS default config:
  //chartDefaults.color = theme.palette.text.primary;
  //chartDefaults.elements.bar.backgroundColor = theme.palette.primary.main;
  //chartDefaults.elements.line.borderColor = theme.palette.primary.main;

  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}> {/* Used by MUI DatePicker */ }
            <App />
          </LocalizationProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  )
}