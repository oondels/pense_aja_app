import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import { AuthorizationService } from "../src/services/authorization.service";
import { CustomError } from "../src/types/CustomError";

describe("AuthorizationService", () => {
  it("buildSessionKey should be deterministic for same inputs", () => {
    const first = AuthorizationService.buildSessionKey("token", "123", "SEST");
    const second = AuthorizationService.buildSessionKey("token", "123", "SEST");

    expect(first).toBe(second);
    expect(first).toHaveLength(64);
  });

  it("assertPermission should throw when permission is missing", () => {
    expect(() =>
      AuthorizationService.assertPermission(
        {
          sessionKey: "abc",
          registration: "123",
          username: "user",
          dassOffice: "SEST",
          permissions: ["idea.evaluate"],
          snapshotVersion: 1,
          snapshotExpiresAt: new Date(),
        },
        "idea.exclude"
      )
    ).toThrow(CustomError);
  });
});
