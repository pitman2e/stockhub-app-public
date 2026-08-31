export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface IApiRequest<TResponse = unknown> {
  readonly method: ApiMethod;
  readonly resource: string;
  readonly url: string;
  readonly body?: unknown;
  readonly responseType?: TResponse;
}

export function createApiRequest<TResponse = unknown>(
  resource: string,
  url: string,
  method: ApiMethod = "GET",
  body?: unknown
): IApiRequest<TResponse> {
  return { resource, url, method, body };
}

export function getApiQueryString(
  values: Record<string, string | number | boolean | undefined | null>
) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
}

export function getApiRoute(...values: (string | undefined | null)[]) {
  return values
    .filter((value): value is string => value !== undefined && value !== null && value !== "")
    .map((value) => encodeURIComponent(value))
    .join("/");
}