import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { DefaultLinearProgress, DefaultPaper } from "../../components/DefaultComponents";
import ImminentErrorIcon from "../../components/ImminentErrorIcon";
import { useQuery } from "@tanstack/react-query";
import repoStockPrice from "../../repo/repoStockPrice";
import ApiRequestAdapter from "../../adapters/apiRequestAdapter";

interface ITickerInfoProps {
  stockId?: string;
}

export default function TickerInfo({ stockId }: ITickerInfoProps) {
  const { isFetching, isLoading, isError, data } = useQuery({
    ...ApiRequestAdapter.queryOptions(repoStockPrice.GetPerformance({ stockId })),
    enabled: !!stockId,
  });

  if (isError && data === undefined) return null;

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <DefaultPaper>
        <Typography variant="h6" gutterBottom>
          Ticker Info {isError && <ImminentErrorIcon />}
        </Typography>
        {isLoading || data === undefined ? (
          <>
            <Typography variant="body1" gutterBottom>
              <Skeleton width="20%" />
            </Typography>
            <Typography variant="body1" gutterBottom>
              <Skeleton width="70%" />
            </Typography>
            <Typography variant="body1" gutterBottom>
              <Skeleton width="50%" />
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              {data.stock.stockId}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data.stock.stockName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Asset Class: {data.stock.assetClass}
            </Typography>

            {data.stock.assetClass === "BOND" && (
              <>
                <Typography variant="body1" gutterBottom>
                  Maturity Date: {data.stock.maturityDate}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Coupon: {data.stock.coupon}%
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Coupon Freq: {data.stock.couponFreq}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Face Value: {data.stock.faceValue}
                </Typography>
              </>
            )}
          </>
        )}
      </DefaultPaper>
    </>
  );
}
