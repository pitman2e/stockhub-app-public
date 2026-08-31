import { ITransactionGetDto } from "../types/api";
import { IPagedApiResult } from "../types/api";
import { createApiRequest, getApiQueryString } from "./apiRequest";

export default class repoStockTransaction {
    static readonly baseUrl = "api/StockTransaction";

    static Get(
        {
            portfolioId,
            stockId,
            transactionType,
            market,
            fmDate,
            toDate,
            limit,
            offset,
        }: {
            portfolioId?: string | null;
            stockId?: string | null;
            transactionType?: string | null;
            market?: string | null;
            fmDate?: number | null;
            toDate?: number | null;
            limit?: number | null;
            offset?: number | null;
        } = {}
    ) {
        const baseUrl = repoStockTransaction.baseUrl;
        const url = baseUrl + "?" + getApiQueryString({
            portfolioId,
            stockId,
            transactionType,
            fmDate,
            toDate,
            market,
            limit,
            offset,
        });

        return createApiRequest<IPagedApiResult<ITransactionGetDto>>(baseUrl, url);
    }

    static Post() {
        const baseUrl = repoStockTransaction.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "POST");
    }

    static Put() {
        const baseUrl = repoStockTransaction.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "PUT");
    }

    static Delete(
        {
            portfolioId,
            iden,
        }: {
            portfolioId: string;
            iden: number;
        }
    ) {
        const baseUrl = repoStockTransaction.baseUrl;
        const url = baseUrl + "?" + getApiQueryString({ portfolioId });
        return createApiRequest(baseUrl, url, "DELETE", { iden });
    }
}
