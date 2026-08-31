import { IStockPortfolio } from "../types/db";
import { IPortfoliosSummary, IPositionChartData } from "../types/api";
import { IStockPositionValue } from "../types/api";
import { createApiRequest, getApiQueryString, getApiRoute } from "./apiRequest";

export default class repoPortfolio {
    static readonly baseUrl = "api/Portfolio";

    static Post() {
        const baseUrl = repoPortfolio.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "POST");
    }

    static Put() {
        const baseUrl = repoPortfolio.baseUrl;

        return createApiRequest(baseUrl, baseUrl, "PUT");
    }

    static Get() {
        const url = repoPortfolio.baseUrl;
        return createApiRequest<IStockPortfolio[]>(repoPortfolio.baseUrl, url);
    }

    static Delete(
        {
            portfolioId,
        }: {
            portfolioId: string;
        }
    ) {
        const baseUrl = repoPortfolio.baseUrl;
        const url = baseUrl + "/" + getApiRoute(portfolioId);
        return createApiRequest(baseUrl, url, "DELETE");
    }

    static GetSummary({ portfolioId, currency }: { portfolioId?: string | null, currency?: string | null } = {}) {
        const baseUrl = repoPortfolio.baseUrl + "/Summary";
        const url = baseUrl + "/" +
            getApiRoute(portfolioId) + "?" +
            getApiQueryString({ displayCurrency: currency });

        return createApiRequest<IPortfoliosSummary>(repoPortfolio.baseUrl, url);
    }

    static GetPositions(
        {
            portfolioId,
            posStatus,
            sortBy,
            isDesc,
        }: {
            portfolioId?: string | null,
            posStatus?: string | null,
            sortBy?: string | null,
            isDesc?: boolean | null,
        } = {}) {
        const baseUrl = repoPortfolio.baseUrl + "/Positions";
        const url = baseUrl + "/" +
            getApiRoute(portfolioId) + "?" +
            getApiQueryString({ posStatus, sortBy, isDesc })

        return createApiRequest<IStockPositionValue[]>(repoPortfolio.baseUrl, url);
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
            getApiQueryString({ portfolioId, stockId, dayRes, fmDate, toDate })

        return createApiRequest<IPositionChartData>(repoPortfolio.baseUrl, url);
    }
}