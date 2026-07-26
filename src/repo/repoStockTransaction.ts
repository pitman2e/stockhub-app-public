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
            portfolioId?: string | null | undefined;
            stockId?: string | null | undefined;
            transactionType?: string | null | undefined;
            market?: string | null | undefined;
            fmDate?: number | null | undefined;
            toDate?: number | null | undefined;
            limit?: number | null | undefined;
            offset?: number | null | undefined;
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
            baseUrl,
            invalidateQueryKeys: [
                utils.getUserQueryKey({ baseUrl }),
                utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
            ]
        }
    }

    static Put() {
        const baseUrl = repoStockTransaction.baseUrl;

        return {
            baseUrl,
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
            response: utils.requestWithToken('DELETE', url, { iden }),
            invalidateQueryKeys: [
                utils.getUserQueryKey({ baseUrl }),
                utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
            ]
        }
    }
}
