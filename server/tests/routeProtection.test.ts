import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const readRoute = (routeFile: string) =>
  readFileSync(path.resolve(__dirname, "../src/routes", routeFile), "utf8");

describe("protected route contracts", () => {
  it("should protect idea audit timeline with idea.view", () => {
    const route = readRoute("penseAja.route.ts");

    expect(route).toContain('"/:dassOffice/:id/audit"');
    expect(route).toContain("verifyToken");
    expect(route).toContain('requirePermission("idea.view"');
  });

  it("should protect point history with self-or-operator policy", () => {
    const route = readRoute("userPensAaja.route.ts");

    expect(route).toContain('"/:registration/points-history"');
    expect(route).toContain("verifyToken");
    expect(route).toContain("requireSelfOrPermission");
    expect(route).toContain('"marketplace.request.approve"');
  });
});
