import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import utils from '../../utils/utils';

interface IGridDetailItemProps {
    netAmtColor: boolean;
    amount: number;
    amountPercentage: number | null;
    currency: string;
}

export default function GridDetailItem({ netAmtColor, amount, amountPercentage, currency }: IGridDetailItemProps) {
    const colorIndicator = (!netAmtColor || amount === 0) ? {} : utils.getColorClass(amount);

    return (
        <Grid container sx={{ flexDirection: "column" }}>
            <Typography sx={colorIndicator} variant="body1" component="p" noWrap>
                {utils.getSignedDecimal(amount, 2)}
            </Typography>

            <Typography sx={colorIndicator} variant="caption" component="p" noWrap>
                {utils.getFmtSgnDec(amountPercentage, 2, `${currency} `, "%")}
            </Typography>
        </Grid>
    )
}