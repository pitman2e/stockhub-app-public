import utils from "../utils/utils";

export default class repoTags {
  static readonly baseUrl = "api/Tags";

  static Get({ category }: { category?: string | null } = {}) {
    const baseUrl = repoTags.baseUrl;
    const url = baseUrl + "/" + utils.getQueryRoute(category);

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl, category }),
      queryFn: utils.getReactQueryFn<string>(url),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }

  static GetPortfolioPie(
    { portfolioId, tag, assetClass }: { portfolioId?: string | null, tag?: string | null, assetClass?: string | null }
  ) {
    const baseUrl = repoTags.baseUrl + "/Pie";
    const url = baseUrl + "/" +
      utils.getQueryRoute(portfolioId) + "?" +
      utils.getQueryStringFromDict({ tag, assetClass })

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl: repoTags.baseUrl, url, portfolioId, tag, assetClass }),
      queryFn: utils.getReactQueryFn(url),
    }
  }

  static Post() {
    const baseUrl = repoTags.baseUrl;

    return {
      requestFn: (content: any) => utils.requestWithToken("POST", baseUrl, content),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
