import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import { AuthorizationService } from "../src/services/authorization.service";
import { CustomError } from "../src/types/CustomError";

describe("AuthorizationService", () => {
  it("assertPermission should throw when permission is missing", () => {
    expect(() =>
      AuthorizationService.assertPermission(
        {
          registration: "123",
          username: "user",
          dassOffice: "SEST",
          permissions: ["idea.evaluate"],
          roles: [],
          unitConfig: {} as any,
        },
        "idea.exclude"
      )
    ).toThrow(CustomError);
  });
});
