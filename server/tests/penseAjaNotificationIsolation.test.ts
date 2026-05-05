import { afterEach, describe, expect, it, vi } from "vitest";
import { PenseAjaService } from "../src/services/pense-aja.service";
import { UserPenseaja } from "../src/services/user-penseaja.service";
import { NotificationService } from "../src/services/notification.service";

const evaluation = {
  id: 8723,
  data_realizada: new Date("2026-05-05T10:00:00.000Z"),
  fabrica: "SEST",
  nome: "Maria Souza",
  matricula: 1234567,
  setor: "Costura",
  gerente: "Ana Gerente",
  nome_projeto: "Redução de retrabalho",
  turno: "A",
  situacao_anterior: "Processo com retrabalho.",
  situacao_atual: "Processo com checklist visual.",
  gerente_aprovador: "ana.gerente",
  analista_avaliador: "joao.analista",
  status_gerente: "aprovado",
  status_analista: "concluido",
  em_espera: "0",
  criado: new Date("2026-05-04T10:00:00.000Z"),
};

describe("PenseAjaService notification isolation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should keep evaluation success when user email lookup fails", async () => {
    vi.spyOn(PenseAjaService, "evaluatePenseAja").mockResolvedValue({
      newEvaluation: evaluation,
      role: "analista",
    });
    vi.spyOn(UserPenseaja, "getUserEmail").mockRejectedValue(
      new Error("email lookup failed")
    );

    const result = await PenseAjaService.evaluatePenseAjaWithNotification(
      "8723",
      {
        dassOffice: "SEST",
        status: "concluido",
        emEspera: false,
        replicavel: true,
        usuario: "analista",
        funcao: "ANALISTA",
      }
    );

    expect(result).toEqual({
      message: "Pense Aja avaliado com sucesso!",
      data: evaluation,
    });
  });

  it("should keep evaluation success when notification check fails", async () => {
    vi.spyOn(PenseAjaService, "evaluatePenseAja").mockResolvedValue({
      newEvaluation: evaluation,
      role: "analista",
    });
    vi.spyOn(UserPenseaja, "getUserEmail").mockResolvedValue({
      email: "maria.souza@grupodass.com.br",
      authorized_notifications_apps: ["pense_aja"],
    });
    vi.spyOn(NotificationService, "isNotificationEnabled").mockRejectedValue(
      new Error("notification check failed")
    );

    const result = await PenseAjaService.evaluatePenseAjaWithNotification(
      "8723",
      {
        dassOffice: "SEST",
        status: "concluido",
        emEspera: false,
        replicavel: true,
        usuario: "analista",
        funcao: "ANALISTA",
      }
    );

    expect(result.message).toBe("Pense Aja avaliado com sucesso!");
  });

  it("should keep evaluation success when notification send fails", async () => {
    vi.spyOn(PenseAjaService, "evaluatePenseAja").mockResolvedValue({
      newEvaluation: evaluation,
      role: "analista",
    });
    vi.spyOn(UserPenseaja, "getUserEmail").mockResolvedValue({
      email: "maria.souza@grupodass.com.br",
      authorized_notifications_apps: ["pense_aja"],
    });
    vi.spyOn(NotificationService, "isNotificationEnabled").mockResolvedValue(
      true
    );
    vi.spyOn(NotificationService, "sendNotification").mockRejectedValue(
      new Error("notification send failed")
    );

    const result = await PenseAjaService.evaluatePenseAjaWithNotification(
      "8723",
      {
        dassOffice: "SEST",
        status: "concluido",
        emEspera: false,
        replicavel: true,
        usuario: "analista",
        funcao: "ANALISTA",
      }
    );

    expect(result.message).toBe("Pense Aja avaliado com sucesso!");
  });

  it("should keep idea creation success when manager lookup fails", async () => {
    vi.spyOn(PenseAjaService, "createPenseAja").mockResolvedValue({
      pense_aja: {
        id: 9001,
        nome: "Maria Souza",
        nome_projeto: "Redução de retrabalho",
        ganhos: ["Qualidade"],
      },
      userManager: null,
      duplicated: false,
    });
    vi.spyOn(UserPenseaja, "getManagerByUser").mockRejectedValue(
      new Error("manager lookup failed")
    );

    const result = await PenseAjaService.submitPenseAja(
      {
        nome: "Redução de retrabalho",
        createDate: "2026-05-05T10:00:00.000Z",
        situationBefore: "Processo com retrabalho.",
        situationNow: "Processo com checklist visual.",
        registration: 1234567,
        perdas: ["retrabalho"],
        userName: "Maria Souza",
        gerente: "Ana Gerente",
        setor: "Costura",
        turno: "A",
        ganhos: ["Qualidade"],
        areaMelhoria: "Qualidade",
        factory: "SEST",
      },
      "SEST"
    );

    expect(result).toEqual({
      statusCode: 201,
      body: {
        message:
          "Pense aja cadastrado com sucesso! Solicite seu gerente para ativar as notificações para vizualizar mais rápido.",
        id: 9001,
      },
    });
  });
});
