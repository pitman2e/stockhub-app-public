import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ISnackbarProps {
    isOpen: boolean;
    severity: "info" | "error" | "success";
    message: string;
}

type ISelectSnackbarState = {
    [K in typeof snackbarSlice.name]: ISnackbarProps
}

const snackbarSlice = createSlice({
    name: 'snackbar',
    initialState: {
        isOpen: false,
        severity: "info",
        message: "",
    } as ISnackbarProps,
    reducers: {
        postInfoMessage: (state, action: PayloadAction<string>) => {
            state.isOpen = true;
            state.severity = "info";
            state.message = action.payload;
        },
        postErrorMessage: (state, action: PayloadAction<string>) => {
            state.isOpen = true;
            state.severity = "error";
            state.message = action.payload ? action.payload : "An error has occured";
        },
        postSuccessMessage: (state, action: PayloadAction<string>) => {
            state.isOpen = true;
            state.severity = "success";
            state.message = action.payload ? action.payload : "Operation completed successfully";
        },
        closeMessage: (state) => {
            state.isOpen = false;
            state.message = "";
        }
    }
})

export const {
    postInfoMessage,
    postErrorMessage,
    postSuccessMessage,
    closeMessage
} = snackbarSlice.actions

export const selectSnackbarState = (state: ISelectSnackbarState) => state.snackbar;

export default snackbarSlice;