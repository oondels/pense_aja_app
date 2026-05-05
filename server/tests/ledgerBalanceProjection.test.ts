import { describe, expect, it } from "vitest";
import { calculateBalanceProjection } from "../src/services/ledger.service";

describe("calculateBalanceProjection", () => {
  it("should discount legacy commits without previous reserve", () => {
    const projection = calculateBalanceProjection({
      totalEarned: 81,
      totalReservedRaw: -40,
      totalCommitted: 40,
      totalRefunded: 0,
      totalReversed: 0,
    });

    expect(projection.totalReserved).toBe(0);
    expect(projection.availableBalance).toBe(41);
  });

  it("should keep active reserve before commit", () => {
    const projection = calculateBalanceProjection({
      totalEarned: 100,
      totalReservedRaw: 40,
      totalCommitted: 0,
      totalRefunded: 0,
      totalReversed: 0,
    });

    expect(projection.totalReserved).toBe(40);
    expect(projection.availableBalance).toBe(60);
  });

  it("should clear active reserve after commit in the new flow", () => {
    const projection = calculateBalanceProjection({
      totalEarned: 100,
      totalReservedRaw: 0,
      totalCommitted: 40,
      totalRefunded: 0,
      totalReversed: 0,
    });

    expect(projection.totalReserved).toBe(0);
    expect(projection.availableBalance).toBe(60);
  });
});
