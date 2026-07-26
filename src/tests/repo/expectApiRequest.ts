import { expect } from "vitest";

export function expectApiRequest(
  request: unknown,
  resource: string,
  url: string,
  method = "GET",
  body: unknown = undefined
) {
  expect(request).toEqual({ resource, url, method, body });
}