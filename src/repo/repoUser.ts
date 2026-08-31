import { createApiRequest } from "./apiRequest";

export default class repoUser {
  static readonly baseUrl = "api/User";

  static Ping() {
    const baseUrl = repoUser.baseUrl + "/Ping";

    return createApiRequest(baseUrl, baseUrl, "POST");
  }
}
