import { ITransactionGetDto } from "../types/api";
import { IPagedApiResult } from "../types/api";
import utils from "../utils/utils";
import repoPortfolio from "./repoPortfolio";

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
        const url = baseUrl + "?" + utils.getQueryStringFromDict({
            portfolioId,
            stockId,
            transactionType,
            fmDate,
            toDate,
            market,
            limit,
            offset,
        });

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl, portfolioId, stockId, transactionType, market, fmDate, toDate, limit, offset }),
            queryFn: utils.getReactQueryFn<IPagedApiResult<ITransactionGetDto>>(url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl })
        };
    }

    static Post() {
        const baseUrl = repoStockTransaction.baseUrl;

        return {
            requestFn: (content: any) => utils.requestWithToken('POST', baseUrl, content),
            invalidateQueryKeys: [
                utils.getUserQueryKey({ baseUrl }),
                utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
            ]
        }
    }

    static Put() {
        const baseUrl = repoStockTransaction.baseUrl;

        return {
            requestFn: (content: any) => utils.requestWithToken('PUT', baseUrl, content),
            invalidateQueryKeys: [
                utils.getUserQueryKey({ baseUrl }),
                utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
            ]
        }
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
        const url = baseUrl + "?" + utils.getQueryStringFromDict({ portfolioId });
        return {
            requestFn: () => utils.requestWithToken('DELETE', url, { iden }),
            invalidateQueryKeys: [
                utils.getUserQueryKey({ baseUrl }),
                utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
            ]
        }
    }
}
