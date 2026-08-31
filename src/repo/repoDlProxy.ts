import { createApiRequest, getApiQueryString } from "./apiRequest";

export interface IYahooChartResponse {
    spark: {
        result: Array<{
            response: Array<{
                meta: {
                    previousClose: number;
                    currentTradingPeriod: { regular: { start: number; end: number } };
                };
                timestamp: number[];
                indicators: { quote: Array<{ close: (number | null)[] }> };
            }>;
        }>;
    };
}

export class repoDlProxy {
    static readonly baseUrl = "api/DlProxy";

    static Get(
        {
            stockId,
        }: {
            stockId?: string | null;
        }
    ) {
        const baseUrl = repoDlProxy.baseUrl + "/YahooChart";
        const url = baseUrl + "?" + getApiQueryString({ stockId });

        return createApiRequest<IYahooChartResponse>(baseUrl, url);
    }
}