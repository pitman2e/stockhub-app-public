import type { AxiosResponse } from "axios";
import type { IApiActionResult } from "../types/api";
import type { IApiRequest } from "../repo/apiRequest";
import { apiClient } from "../utils/apiClient";
import utils from "../utils/utils";

const invalidatedResources: Record<string, string[]> = {
  "api/StockTransaction": ["api/StockTransaction", "api/Portfolio"],
};

export default class ApiRequestAdapter {
  static execute<TResponse>(
    request: IApiRequest<TResponse>,
    body?: unknown
  ): Promise<AxiosResponse<IApiActionResult<TResponse>>> {
    return apiClient.request<IApiActionResult<TResponse>>({
      method: request.method,
      url: request.url,
      data: body === undefined ? request.body : body,
    });
  }

  static async query<TResponse>(request: IApiRequest<TResponse>): Promise<TResponse> {
    const response = await this.execute(request);
    return response.data.payload as TResponse;
  }

  static queryOptions<TResponse>(request: IApiRequest<TResponse>) {
    return {
      ...utils.reactQueryDefaults,
      queryKey: utils.getUserQueryKey({ baseUrl: request.resource, url: request.url }),
      queryFn: () => this.query(request),
      invalidateQueryKey: utils.getUserQueryKey({ baseUrl: request.resource }),
    };
  }

  static mutationOptions(request: IApiRequest) {
    const resources = invalidatedResources[request.resource] ?? [request.resource];
    const queryKeys = resources.map((resource) => utils.getUserQueryKey({ baseUrl: resource }));

    return {
      requestFn: (body?: unknown) => this.execute(request, body),
      invalidateQueryKey: queryKeys[0],
      invalidateQueryKeys: queryKeys,
    };
  }
}