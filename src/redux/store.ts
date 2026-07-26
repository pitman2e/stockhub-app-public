import { configureStore } from '@reduxjs/toolkit'
import snackbarSlice from './snackbarSlice';

export default configureStore({
    reducer: {
        snackbar: snackbarSlice.reducer
    }
})