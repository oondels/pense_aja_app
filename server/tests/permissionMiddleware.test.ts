import { describe, expect, it, vi, afterEach } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import {
  requireAnyPermission,
  requirePermission,
  requireSelfOrPermission,
} from "../src/middlewares/permissionMiddleware";
import { AuthorizationService } from "../src/services/authorization.service";

describe("requirePermission", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should attach authContext and call next when permission is granted", async () => {
    const middleware = requirePermission("idea.evaluate", () => "SEST");
    const context = {
      registration: "123",
      username: "tester",
      dassOffice: "SEST" as const,
      permissions: ["idea.evaluate"],
      roles: [],
      unitConfig: {} as any,
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
      registration: "123",
      username: "tester",
      dassOffice: "SEST" as const,
      permissions: ["marketplace.request.approve"],
      roles: [],
      unitConfig: {} as any,
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

  it("should allow self access without resolving RBAC permissions", async () => {
    const middleware = requireSelfOrPermission(
      "marketplace.request.approve",
      () => "SEST",
      () => "123"
    );
    const resolveSpy = vi.spyOn(AuthorizationService, "resolveSessionContext");
    const req = {
      user: {
        usuario: "tester",
        funcao: "OPERADOR",
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

    expect(resolveSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should require permission for third-party access", async () => {
    const middleware = requireSelfOrPermission(
      "marketplace.request.approve",
      () => "SEST",
      () => "456"
    );
    const context = {
      registration: "123",
      username: "tester",
      dassOffice: "SEST" as const,
      permissions: ["marketplace.request.approve"],
      roles: [],
      unitConfig: {} as any,
    };

    vi.spyOn(AuthorizationService, "resolveSessionContext").mockResolvedValue(context);
    vi.spyOn(AuthorizationService, "assertPermission").mockImplementation(() => {});

    const req = {
      user: {
        usuario: "tester",
        funcao: "OPERADOR",
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

    expect(AuthorizationService.assertPermission).toHaveBeenCalledWith(
      context,
      "marketplace.request.approve"
    );
    expect(req.authContext).toEqual(context);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
