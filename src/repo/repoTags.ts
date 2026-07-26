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

  static Post() {
    const baseUrl = repoTags.baseUrl;

    return {
      baseUrl,
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
