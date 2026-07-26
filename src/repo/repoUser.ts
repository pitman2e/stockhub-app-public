import utils from "../utils/utils";

export default class repoUser {
  static readonly baseUrl = "api/User";

  static Ping() {
    const baseUrl = repoUser.baseUrl + "/Ping";

    return {
      requestFn: () => utils.requestWithToken("POST", baseUrl),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl }),
    };
  }
}
