import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';


interface IStockTickerLinkProps {
    stockId: string
}

export default function StockTickerLink({ stockId }: IStockTickerLinkProps) {
    return (
        <Link
            component={RouterLink}
            color="inherit" underline="hover" variant="body2"
            to={`/ticker-overview/${stockId}`}
        >
            {stockId}
        </Link>
    )
};