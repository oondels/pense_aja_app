import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import { AuthorizationService } from "../src/services/authorization.service";
import * as database from "../src/config/database";
import { UnitSettingsService } from "../src/services/unit-settings.service";
import { CustomError } from "../src/types/CustomError";

describe("AuthorizationService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("resolves permissions from all active roles in the requested unit", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([{ code: "idea.evaluate" }, { code: "catalog.manage" }])
      .mockResolvedValueOnce([
        { code: "idea_reviewer", nome: "Avaliador de ideias", dassOffice: "SEST" },
        { code: "marketplace_admin", nome: "Administrador de loja", dassOffice: "SEST" },
      ]);

    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      manager: { query },
    } as any);
    vi.spyOn(UnitSettingsService, "getSettings").mockResolvedValue({} as any);

    const context = await AuthorizationService.resolveSessionContext(
      {
        id: "1",
        usuario: "user@grupodass.com.br",
        codbarras: "",
        rfid: "",
        matricula: "1234567",
        setor: "",
        nivel: "",
        unidade: "SEST",
        funcao: "analista",
      },
      "SEST"
    );

    expect(context.permissions).toEqual(["idea.evaluate", "catalog.manage"]);
    expect(context.roles.map((role) => role.code)).toEqual([
      "idea_reviewer",
      "marketplace_admin",
    ]);
  });
});
