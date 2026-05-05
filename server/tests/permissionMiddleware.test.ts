import { describe, expect, it, vi, afterEach } from "vitest";
import {
  requireAnyPermission,
  requirePermission,
} from "../src/middlewares/permissionMiddleware";
import { AuthorizationService } from "../src/services/authorization.service";

describe("requirePermission", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should attach authContext and call next when permission is granted", async () => {
    const middleware = requirePermission("idea.evaluate", () => "SEST");
    const context = {
      sessionKey: "session",
      registration: "123",
      username: "tester",
      dassOffice: "SEST" as const,
      permissions: ["idea.evaluate"],
      snapshotVersion: 1,
      snapshotExpiresAt: new Date(),
    };

    vi.spyOn(AuthorizationService, "resolveSessionContext").mockResolvedValue(context);
    vi.spyOn(AuthorizationService, "assertPermission").mockImplementation(() => {});

    const req = {
      user: {
        usuario: "tester",
        funcao: "ANALISTA",
        matricula: "123",
      },
      cookies: { token: "token" },
      authContext: undefined,
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.authContext).toEqual(context);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when office resolver returns undefined", async () => {
    const middleware = requirePermission("idea.evaluate", () => undefined);
    const req = {
      user: {
        usuario: "tester",
        funcao: "ANALISTA",
        matricula: "123",
      },
      cookies: { token: "token" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach authContext when any accepted permission is granted", async () => {
    const middleware = requireAnyPermission(
      ["marketplace.request.approve", "marketplace.refund"],
      () => "SEST"
    );
    const context = {
      sessionKey: "session",
      registration: "123",
      username: "tester",
      dassOffice: "SEST" as const,
      permissions: ["marketplace.request.approve"],
      snapshotVersion: 1,
      snapshotExpiresAt: new Date(),
    };

    vi.spyOn(AuthorizationService, "resolveSessionContext").mockResolvedValue(context);
    vi.spyOn(AuthorizationService, "assertAnyPermission").mockImplementation(() => {});

    const req = {
      user: {
        usuario: "tester",
        funcao: "ANALISTA",
        matricula: "123",
      },
      cookies: { token: "token" },
      authContext: undefined,
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.authContext).toEqual(context);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
