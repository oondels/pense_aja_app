import { afterEach, describe, expect, it, vi } from "vitest";

const originalJwtSecret = process.env.JWT_SECRET;

describe("dotenv config", () => {
  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    vi.resetModules();
  });

  it("should fail fast when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    vi.resetModules();

    await expect(import("../src/config/dotenv")).rejects.toThrow(
      "JWT_SECRET não configurado."
    );
  });
});
