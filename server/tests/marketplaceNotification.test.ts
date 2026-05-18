import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import { DomainEventNotificationService } from "../src/services/domain-event-notification.service";
import { NotificationService } from "../src/services/notification.service";
import { UserPenseaja } from "../src/services/user-penseaja.service";
import { MarketplaceRequestRecord } from "../src/types/contracts";

const REQUEST: MarketplaceRequestRecord = {
  id: 10,
  registration: "1234567",
  requesterName: "Usuario Teste",
  dassOffice: "SEST",
  catalogItemId: "catalog-uuid",
  catalogItemName: "Mochila",
  catalogItemPointsCost: 50,
  catalogItemType: "physical",
  requestStatus: "pending_approval",
  reservedLedgerEntryId: 5,
  approvalActorRegistration: null,
  approvalActorName: null,
  fulfillmentType: "physical_delivery",
  legacyPrizeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const buildOperatorQueryBuilder = () => {
  const queryBuilder = {
    innerJoin: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getRawMany: vi.fn().mockResolvedValue([
      { registration: "1111111", email: "operador@grupodass.com.br" },
      { registration: "1111111", email: "operador@grupodass.com.br" },
      { registration: "2222222", email: "admin@grupodass.com.br" },
    ]),
  };

  vi.spyOn(database, "initializeDatabase").mockResolvedValue({
    getRepository: () => ({
      createQueryBuilder: () => queryBuilder,
    }),
  } as any);

  return queryBuilder;
};

describe("DomainEventNotificationService — marketplace notifications", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("notifies unique marketplace operators and admins when request is created", async () => {
    buildOperatorQueryBuilder();
    vi.spyOn(NotificationService, "isNotificationEnabled").mockImplementation(
      async (registration) => String(registration) === "1111111"
    );
    const sendNotification = vi
      .spyOn(NotificationService, "sendNotification")
      .mockResolvedValue(undefined);

    const result = await DomainEventNotificationService.dispatch({
      type: "marketplace.request.created",
      request: REQUEST,
      dassOffice: "SEST",
    });

    expect(result).toEqual({ notificationTargetFound: true });
    expect(NotificationService.isNotificationEnabled).toHaveBeenCalledTimes(2);
    expect(sendNotification).toHaveBeenCalledOnce();
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "operador@grupodass.com.br",
        title: "Nova solicitação de resgate.",
        link: expect.stringContaining("/admin/marketplace"),
      })
    );
  });

  it("does not send requester update when notification is disabled", async () => {
    vi.spyOn(UserPenseaja, "getUserEmail").mockResolvedValue({
      email: "usuario@grupodass.com.br",
      authorized_notifications_apps: ["pense_aja"],
    });
    vi.spyOn(NotificationService, "isNotificationEnabled").mockResolvedValue(false);
    const sendNotification = vi
      .spyOn(NotificationService, "sendNotification")
      .mockResolvedValue(undefined);

    const result = await DomainEventNotificationService.dispatch({
      type: "marketplace.request.updated",
      request: { ...REQUEST, requestStatus: "completed" },
      dassOffice: "SEST",
    });

    expect(result).toEqual({ notificationTargetFound: true });
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("notifies requester when marketplace request is updated", async () => {
    vi.spyOn(UserPenseaja, "getUserEmail").mockResolvedValue({
      email: "usuario@grupodass.com.br",
      authorized_notifications_apps: ["pense_aja"],
    });
    vi.spyOn(NotificationService, "isNotificationEnabled").mockResolvedValue(true);
    const sendNotification = vi
      .spyOn(NotificationService, "sendNotification")
      .mockResolvedValue(undefined);

    const result = await DomainEventNotificationService.dispatch({
      type: "marketplace.request.updated",
      request: { ...REQUEST, requestStatus: "rejected" },
      dassOffice: "SEST",
    });

    expect(result).toEqual({ notificationTargetFound: true });
    expect(NotificationService.isNotificationEnabled).toHaveBeenCalledWith(
      "1234567",
      "SEST"
    );
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "usuario@grupodass.com.br",
        title: "Solicitação de resgate atualizada.",
        message: expect.stringContaining("rejeitada"),
        link: expect.stringContaining("/marketplace"),
      })
    );
  });
});
