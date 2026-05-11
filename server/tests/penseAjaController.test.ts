import { describe, expect, it, vi, afterEach } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import { PenseAjaController } from "../src/controllers/pense-aja.controller";
import { PenseAjaService } from "../src/services/pense-aja.service";

describe("PenseAjaController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should pass undefined dates when list filters omit date range", async () => {
    const fetchSpy = vi.spyOn(PenseAjaService, "fetchPenseAja").mockResolvedValue([]);
    const req = {
      params: { dassOffice: "SEST" },
      query: {},
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await PenseAjaController.listIdeas(req, res, next);

    expect(fetchSpy).toHaveBeenCalledWith(
      "SEST",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
