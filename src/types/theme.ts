export interface IColorMode {
  toggleColorMode(): void;
}

//You have to use module augmentation to add new variables to the Theme and ThemeOptions.
//https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
declare module '@mui/material/styles' {
    interface Theme {
        deltaColor: {
            up: {
                color: string;
            };
            down: {
                color: string;
            };
        };
        chartGreyLine: {
            color: string;
        };
        gridItemHover: {
            color: string;
        };
    }
    // allow configuration using `createTheme()`
    interface ThemeOptions {
        deltaColor?: {
            up?: {
                color: string;
            };
            down?: {
                color: string;
            };
        };
        chartGreyLine?: {
            color: string;
        };
        gridItemHover?: {
            color: string;
        };
    }
}