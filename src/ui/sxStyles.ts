import { Theme } from "@mui/material/styles";

const sxStyles = {
    deltaUp: {
        color: (theme: Theme) => theme.deltaColor.up
    },
    deltaDown: {
        color: (theme: Theme) => theme.deltaColor.down
    },
}

export default sxStyles;