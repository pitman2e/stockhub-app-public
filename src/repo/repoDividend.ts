import { IStockDividend } from "../types/db";
import { createApiRequest, getApiQueryString, getApiRoute } from "./apiRequest";

export default class repoDividend {
  static readonly baseUrl = "api/Dividend";

  static Get(
    {
      portfolioId,
      stockId,
    }: {
      portfolioId?: string | null;
      stockId?: string | null;
    } = {}
  ) {
    const baseUrl = repoDividend.baseUrl;
    const url = baseUrl + "/" + getApiRoute(portfolioId) + "?" + getApiQueryString({ stockId });

    return createApiRequest<IStockDividend[]>(baseUrl, url);
  }

  static RequestDL(
    {
      stockId,
    }: {
      stockId: string;
    }
  ) {
    const baseUrl = repoDividend.baseUrl;
    const url = baseUrl + "/RequestDL" + "/" + getApiRoute(stockId);

    return createApiRequest(baseUrl, url, "POST");
  }

  static Put() {
    const baseUrl = repoDividend.baseUrl;

    return createApiRequest(baseUrl, baseUrl, "PUT");
  }
}
