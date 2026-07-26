import { describe, it } from "vitest";
import repoUser from "../../repo/repoUser";
import { expectApiRequest } from "./expectApiRequest";

describe("repoUser", () => {
  it("builds user ping requests", () => {
    expectApiRequest(repoUser.Ping(), "api/User/Ping", "api/User/Ping", "POST");
  });
});