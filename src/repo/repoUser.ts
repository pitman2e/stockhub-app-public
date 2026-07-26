import utils from "../utils/utils";

export default class repoUser {
  static readonly baseUrl = "api/User";

  static Ping() {
    const baseUrl = repoUser.baseUrl + "/Ping";
    const url = baseUrl 

    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl }),
      queryFn: utils.getReactQueryPostFn(url),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
