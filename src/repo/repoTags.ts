import { createApiRequest, getApiQueryString, getApiRoute } from "./apiRequest";
import { IChartJsDataSets } from "../types/api";

export default class repoTags {
  static readonly baseUrl = "api/Tags";

  static Get({ category }: { category?: string | null } = {}) {
    const baseUrl = repoTags.baseUrl;
    const url = baseUrl + "/" + getApiRoute(category);

    return createApiRequest<string>(baseUrl, url);
  }

  static GetPortfolioPie(
    { portfolioId, tag, assetClass }: { portfolioId?: string | null, tag?: string | null, assetClass?: string | null }
  ) {
    const baseUrl = repoTags.baseUrl + "/Pie";
    const url = baseUrl + "/" +
      getApiRoute(portfolioId) + "?" +
      getApiQueryString({ tag, assetClass })

    return createApiRequest<IChartJsDataSets>(repoTags.baseUrl, url);
  }

  static Post() {
    const baseUrl = repoTags.baseUrl;

    return createApiRequest(baseUrl, baseUrl, "POST");
  }
}
