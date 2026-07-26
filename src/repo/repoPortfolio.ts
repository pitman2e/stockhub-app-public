import { IStockPortfolio } from "../types/db";
import { IPortfoliosSummary } from "../types/api";
import { IStockPositionValue } from "../types/api";
import utils from "../utils/utils";

export default class repoPortfolio {
    static readonly baseUrl = "api/Portfolio";

    static Post() {
        const baseUrl = repoPortfolio.baseUrl;

        return {
            baseUrl,
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
        }
    }

    static Get() {
        const url = repoPortfolio.baseUrl;
        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl, url }),
            queryFn: utils.getReactQueryFn<IStockPortfolio[]>(url),
        }
    }

    static Delete(
        {
            portfolioId,
        }: {
            portfolioId: string;
        }
    ) {
        const baseUrl = repoPortfolio.baseUrl;
        const url = baseUrl + "/" + utils.getQueryRoute(portfolioId);
        return {
            response: utils.requestWithToken('DELETE', url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
        }
    }

    static GetSummary({ portfolioId, currency }: { portfolioId?: string | null, currency?: string | null } = {}) {
        const baseUrl = repoPortfolio.baseUrl + "/Summary";
        const url = baseUrl + "/" +
            utils.getQueryRoute(portfolioId) + "?" +
            utils.getQueryStringFromDict({ displayCurrency: currency });

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl, url, portfolioId, currency }),
            queryFn: utils.getReactQueryFn<IPortfoliosSummary>(url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
        }
    }

    static GetPositions(
        {
            portfolioId,
            posStatus,
            sortBy,
            isDesc,
        }: {
            portfolioId?: string | null | undefined,
            posStatus?: string | null,
            sortBy?: string | null,
            isDesc?: boolean | null,
        } = {}) {
        const baseUrl = repoPortfolio.baseUrl + "/Positions";
        const url = baseUrl + "/" +
            utils.getQueryRoute(portfolioId) + "?" +
            utils.getQueryStringFromDict({ posStatus, sortBy, isDesc })

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl, url, portfolioId, posStatus, sortBy, isDesc }),
            queryFn: utils.getReactQueryFn<IStockPositionValue[]>(url),
            invalidateQueryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl }),
        }
    }

    static GetPositionChart(
        {
            portfolioId,
            stockId,
            dayRes,
            fmDate,
            toDate,
        }: {
            portfolioId?: string,
            stockId?: string,
            dayRes?: number,
            fmDate: number,
            toDate: number,
        }) {

        const baseUrl = repoPortfolio.baseUrl + "/PositionChart";
        const url = baseUrl +
            "?" +
            utils.getQueryStringFromDict({ portfolioId, stockId, dayRes, fmDate, toDate })

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl, url, portfolioId, stockId, dayRes, fmDate, toDate }),
            queryFn: utils.getReactQueryFn(url),
        }
    }

    static GetPortfolioPie(
        { portfolioId, tag, assetClass }: { portfolioId?: string | null, tag?: string | null, assetClass?: string | null }
    ) {
        const baseUrl = repoPortfolio.baseUrl + "/Pie";
        const url = baseUrl + "/" +
            utils.getQueryRoute(portfolioId) + "?" +
            utils.getQueryStringFromDict({ tag, assetClass })

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl: repoPortfolio.baseUrl, url, portfolioId, tag, assetClass }),
            queryFn: utils.getReactQueryFn(url),
        }
    }
}