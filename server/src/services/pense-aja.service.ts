import { randomUUID } from "crypto";
import { QueryRunner } from "typeorm";
import { initializeDatabase } from "../config/database";
import MarketplaceRedemptionRequestEntity from "../models/MarketplaceRedemptionRequest";
import PenseAjaDassEntity, { PenseAjaDass } from "../models/PenseAjaDass";
import PenseAjaLojaEntity from "../models/PenseAjaLoja";
import PenseAjaPontosEntity from "../models/PenseAjaPontos";
import PenseAjaPremiosEntity from "../models/PenseAjaPremios";
import logger from "../utils/logger";
import { assertDassOffice } from "../utils/dassOffice";
import { CustomError } from "../types/CustomError";
import { UserPenseaja } from "./user-penseaja.service";
import { NotificationService } from "./notification.service";
import { AuditService } from "./audit.service";
import { LedgerService } from "./ledger.service";
import {
  CreatePenseAjaResult,
  DassOffice,
  EvaluatePenseAjaResponse,
  EvaluatePenseAjaResult,
  EvaluationData,
  NewProduct,
  PenseAjaData,
  PenseAjaDetails,
  PenseAjaFilters,
  PenseAjaListItem,
  ProductRecord,
  ProductUpdateInput,
  PurchaseProductPayload,
  PurchaseProductResponse,
  SubmitPenseAjaResponse,
  UploadFileReference,
  UserPointsBalance,
} from "../types/contracts";

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("pt-BR");

const turnoMap: Record<string, string> = {
  A: "1° Turno",
  B: "2° Turno",
  C: "3° Turno",
};

const appBaseUrl =
  process.env.DEV_ENV === "development"
    ? "http://localhost:5173"
    : "http://10.100.1.43:5050";

const formatUserName = (name: string) => {
  const splitedName = name.split(" ");
  return `${splitedName[0]} ${splitedName[splitedName.length - 1]}`;
};

const normalizeTurno = (turno?: string) => {
  if (!turno) {
    return undefined;
  }

  if (turno === "1° Turno") return "A";
  if (turno === "2° Turno") return "B";
  if (turno === "3° Turno") return "C";
  return turno;
};

const toFlag = (value?: boolean) => (value ? "1" : "0");

const releaseQueryRunner = async (queryRunner: QueryRunner) => {
  if (!queryRunner.isReleased) {
    await queryRunner.release();
  }
};

const hasPermission = (permissions: string[] | undefined, permission: string) =>
  Array.isArray(permissions) && permissions.includes(permission);

const mapIdeaAuditState = (idea: PenseAjaDass) => ({
  id: Number(idea.id),
  matricula: String(idea.matricula),
  unidade_dass: idea.unidade_dass,
  status_analista: idea.status_analista,
  status_gerente: idea.status_gerente,
  analista_avaliador: idea.analista_avaliador,
  gerente_aprovador: idea.gerente_aprovador,
  classificacao: idea.classificacao,
  em_espera: idea.em_espera,
  replicavel: idea.replicavel,
  excluido: idea.excluido,
  a3_mae: idea.a3_mae,
});

const mapListItem = (row: Record<string, unknown>): PenseAjaListItem => ({
  id: Number(row.id),
  criado: formatDate(row.criado as string | Date),
  matricula: Number(row.matricula),
  fabrica: (row.fabrica as string | null) ?? null,
  nome: String(row.nome ?? ""),
  setor: String(row.setor ?? ""),
  gerente: String(row.gerente ?? ""),
  nome_projeto: String(row.nome_projeto ?? ""),
  turno: turnoMap[String(row.turno ?? "")] || "Comercial",
  situacao_anterior: String(row.situacao_anterior ?? ""),
  situacao_atual: String(row.situacao_atual ?? ""),
  ganhos: (row.ganhos as string[] | null) ?? null,
  outros_ganhos: (row.outros_ganhos as string | null) ?? null,
  gerente_aprovador: (row.gerente_aprovador as string | null) ?? null,
  analista_avaliador: (row.analista_avaliador as string | null) ?? null,
  status_gerente: (row.status_gerente as string | null) ?? null,
  status_analista: (row.status_analista as string | null) ?? null,
  em_espera:
    row.em_espera === null || row.em_espera === undefined
      ? null
      : (row.em_espera as string | boolean),
  createdat: row.createdat as string | Date,
  classificacao: (row.classificacao as string | null) ?? null,
  pontuacao:
    row.pontuacao === null || row.pontuacao === undefined
      ? null
      : Number(row.pontuacao),
});

const mapEvaluationRow = (
  idea: PenseAjaDass
): EvaluatePenseAjaResult["newEvaluation"] => ({
  id: Number(idea.id),
  data_realizada: idea.data_realizada,
  fabrica: idea.fabrica,
  nome: idea.nome,
  matricula: Number(idea.matricula),
  setor: idea.setor,
  gerente: idea.gerente,
  nome_projeto: idea.nome_projeto,
  turno: idea.turno,
  situacao_anterior: idea.situacao_anterior,
  situacao_atual: idea.situacao_atual,
  gerente_aprovador: idea.gerente_aprovador,
  analista_avaliador: idea.analista_avaliador,
  status_gerente: idea.status_gerente,
  status_analista: idea.status_analista,
  em_espera: idea.em_espera,
  criado: idea.createdat,
});

export const PenseAjaService = {
  async fetchPenseAja(
    dassOffice: string,
    startDateParsed: PenseAjaFilters["startDate"],
    endDateParsed: PenseAjaFilters["endDate"],
    name?: string,
    sector?: string,
    manager?: string,
    project?: string,
    turno?: string,
    status?: string
  ): Promise<PenseAjaListItem[]> {
    const validDassOffice = assertDassOffice(dassOffice);

    try {
      const dataSource = await initializeDatabase();
      const query = dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("idea.id", "id")
        .addSelect("idea.data_realizada", "criado")
        .addSelect("idea.matricula", "matricula")
        .addSelect("idea.fabrica", "fabrica")
        .addSelect("idea.nome", "nome")
        .addSelect("idea.setor", "setor")
        .addSelect("idea.gerente", "gerente")
        .addSelect("idea.nome_projeto", "nome_projeto")
        .addSelect("idea.turno", "turno")
        .addSelect("idea.situacao_anterior", "situacao_anterior")
        .addSelect("idea.situacao_atual", "situacao_atual")
        .addSelect("idea.ganhos", "ganhos")
        .addSelect("idea.outros_ganhos", "outros_ganhos")
        .addSelect("idea.gerente_aprovador", "gerente_aprovador")
        .addSelect("idea.analista_avaliador", "analista_avaliador")
        .addSelect("idea.status_gerente", "status_gerente")
        .addSelect("idea.status_analista", "status_analista")
        .addSelect("idea.em_espera", "em_espera")
        .addSelect("idea.createdat", "createdat")
        .addSelect("idea.classificacao", "classificacao")
        .addSelect("points.valor", "pontuacao")
        .leftJoin(
          (subQuery) =>
            subQuery
              .select("pontos.id_pense_aja", "id_pense_aja")
              .addSelect("MAX(pontos.valor)", "valor")
              .from("pense_aja.pense_aja_pontos", "pontos")
              .where("pontos.unidade_dass = :dassOffice", {
                dassOffice: validDassOffice,
              })
              .groupBy("pontos.id_pense_aja"),
          "points",
          "points.id_pense_aja = CAST(idea.id AS bigint)"
        )
        .where("idea.excluido = false")
        .andWhere("idea.createdat >= :startDate", {
          startDate: startDateParsed,
        })
        .andWhere("idea.createdat < (:endDate::timestamptz + interval '1 day')", {
          endDate: endDateParsed,
        })
        .andWhere("idea.unidade_dass = :dassOffice", {
          dassOffice: validDassOffice,
        });

      if (name) {
        query.andWhere("idea.nome = :name", { name });
      }

      if (sector) {
        query.andWhere("idea.setor = :sector", { sector });
      }

      if (manager) {
        query.andWhere("idea.gerente = :manager", { manager });
      }

      if (project) {
        query.andWhere("idea.nome_projeto = :project", { project });
      }

      const normalizedTurno = normalizeTurno(turno);
      if (normalizedTurno) {
        query.andWhere("idea.turno = :turno", { turno: normalizedTurno });
      }

      if (status) {
        query.andWhere(
          "(idea.status_gerente = :status OR idea.status_analista = :status)",
          { status }
        );
      }

      const rows = await query.orderBy("idea.createdat", "DESC").getRawMany();
      return rows.map((row) => mapListItem(row as Record<string, unknown>));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido!";

      logger.error(
        "Pense-aja",
        `Erro ao consultar registros da tabela inicial: ${errorMessage}`
      );
      throw error;
    }
  },

  async createPenseAja(
    data: PenseAjaData,
    dassOffice: string
  ): Promise<CreatePenseAjaResult> {
    const validDassOffice = assertDassOffice(dassOffice);

    const requiredFields: Array<keyof PenseAjaData> = [
      "nome",
      "createDate",
      "situationBefore",
      "situationNow",
      "registration",
      "userName",
      "gerente",
      "setor",
      "turno",
      "areaMelhoria",
      "factory",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(
        `Campos obrigatórios ausentes ou inválidos: ${missingFields.join(", ")}`
      );
    }

    if (!data.perdas) {
      data.perdas = [];
    }

    const perdasLean: Record<string, keyof PenseAjaDass> = {
      Superprodução: "super_producao",
      Transporte: "transporte",
      Processamento: "processamento",
      Movimento: "movimento",
      Estoque: "estoque",
      Espera: "espera",
      Talento: "talento",
      Retrabalho: "retrabalho",
    };

    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.query(
        `SELECT pg_advisory_xact_lock(hashtext($1 || $2), hashtext($3 || $4))`,
        [
          String(data.registration ?? ""),
          String(data.nome ?? ""),
          String(data.createDate ?? ""),
          String(validDassOffice ?? ""),
        ]
      );

      const ideaRepository = queryRunner.manager.getRepository(PenseAjaDassEntity);
      const duplicated = await ideaRepository
        .createQueryBuilder("idea")
        .select("idea.id", "id")
        .addSelect("idea.nome", "nome")
        .addSelect("idea.nome_projeto", "nome_projeto")
        .addSelect("idea.ganhos", "ganhos")
        .where("idea.matricula = :matricula", {
          matricula: String(data.registration),
        })
        .andWhere("idea.nome_projeto = :project", { project: data.nome })
        .andWhere("idea.data_realizada = :createDate", {
          createDate: data.createDate,
        })
        .andWhere("idea.unidade_dass = :dassOffice", {
          dassOffice: validDassOffice,
        })
        .andWhere("idea.excluido = false")
        .orderBy("idea.id", "DESC")
        .getRawOne<{
          id: string;
          nome: string;
          nome_projeto: string;
          ganhos: string[] | null;
        }>();

      if (duplicated) {
        await queryRunner.commitTransaction();
        return {
          pense_aja: {
            id: Number(duplicated.id),
            nome: duplicated.nome,
            nome_projeto: duplicated.nome_projeto,
            ganhos: duplicated.ganhos,
          },
          userManager: null,
          duplicated: true,
        };
      }

      const now = new Date();
      const perdasSelecionadas = new Set(data.perdas);
      const perdasValues = Object.entries(perdasLean).reduce(
        (acc, [label, key]) => ({
          ...acc,
          [key]: perdasSelecionadas.has(label) ? "1" : "0",
        }),
        {} as Partial<PenseAjaDass>
      );

      const newIdea = ideaRepository.create({
        createdat: now,
        updatedat: now,
        deletedat: null,
        excluido: false,
        matricula: String(data.registration),
        unidade_dass: validDassOffice,
        nome: data.userName,
        turno: data.turno,
        setor: data.setor,
        lider: "",
        gerente: data.gerente,
        nome_projeto: data.nome,
        data_realizada: new Date(data.createDate),
        situacao_anterior: data.situationBefore,
        situacao_atual: data.situationNow,
        ...perdasValues,
        a3_mae: data.a3Mae || "",
        ganhos: data.ganhos ?? null,
        outros_ganhos: data.ganhoDetalhes || "",
        setor_melhoria: data.areaMelhoria,
        fabrica: data.factory,
      });

      const savedIdea = await ideaRepository.save(newIdea);
      const userManager = await UserPenseaja.getManagerByUser(
        data.registration,
        validDassOffice
      );

      await queryRunner.commitTransaction();

      return {
        pense_aja: {
          id: Number(savedIdea.id),
          nome: savedIdea.nome,
          nome_projeto: savedIdea.nome_projeto,
          ganhos: (savedIdea.ganhos as string[] | null) ?? null,
        },
        userManager,
        duplicated: false,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      const messageError =
        error instanceof Error ? error.message : "Erro desconhecido!";
      logger.error("Pense-aja", `Erro ao registrar pense aja: ${messageError}`);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError("Erro ao registrar pense aja.");
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async submitPenseAja(
    data: PenseAjaData,
    dassOffice: string
  ): Promise<SubmitPenseAjaResponse> {
    const validDassOffice = assertDassOffice(dassOffice);
    const { pense_aja, userManager, duplicated } = await this.createPenseAja(
      data,
      dassOffice
    );

    if (duplicated) {
      return {
        statusCode: 200,
        body: {
          message: "Registro já existente. Ignorando duplicidade.",
          id: pense_aja.id,
        },
      };
    }

    if (userManager) {
      const notificationEnabled = await NotificationService.isNotificationEnabled(
        userManager.matricula,
        validDassOffice
      );

      if (notificationEnabled) {
        await NotificationService.sendNotification({
          to: String(userManager.matricula),
          subject: "Aplicativo Pense Aja",
          title: "Novo Pense Aja Cadastrado.",
          message: `Um novo registro de Pense Aja foi cadastrado pelo usuário ${formatUserName(
            pense_aja.nome
          )}. Projeto: ${pense_aja.nome_projeto}.`,
          application: "Pense e Aja",
          link: `${appBaseUrl}/pense-aja/${pense_aja.id}`,
        });
      }
    }

    const message = userManager
      ? "Pense aja cadastrado com sucesso!"
      : "Pense aja cadastrado com sucesso! Solicite seu gerente para ativar as notificações para vizualizar mais rápido.";

    return {
      statusCode: 201,
      body: {
        message,
        id: pense_aja.id,
      },
    };
  },

  async getPenseAjaById(id: string, dassOffice: string): Promise<PenseAjaDetails> {
    const validDassOffice = assertDassOffice(dassOffice);

    try {
      const dataSource = await initializeDatabase();
      const data = await dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("idea.matricula", "matricula")
        .addSelect("idea.nome", "nome")
        .addSelect("idea.setor", "setor")
        .addSelect("idea.turno", "turno")
        .addSelect("idea.gerente", "gerente")
        .addSelect("idea.data_realizada", "criado")
        .addSelect("idea.situacao_anterior", "situacao_anterior")
        .addSelect("idea.situacao_atual", "situacao_atual")
        .addSelect("idea.nome_projeto", "nome_projeto")
        .addSelect("idea.super_producao", "super_producao")
        .addSelect("idea.transporte", "transporte")
        .addSelect("idea.processamento", "processamento")
        .addSelect("idea.movimento", "movimento")
        .addSelect("idea.estoque", "estoque")
        .addSelect("idea.espera", "espera")
        .addSelect("idea.talento", "talento")
        .addSelect("idea.retrabalho", "retrabalho")
        .addSelect("idea.gerente_aprovador", "gerente_aprovador")
        .addSelect("idea.data_aprogerente", "data_aprogerente")
        .addSelect("idea.analista_avaliador", "analista_avaliador")
        .addSelect("idea.classificacao", "classificacao")
        .addSelect("idea.a3_mae", "a3_mae")
        .addSelect("idea.fabrica", "fabrica")
        .addSelect("idea.ganhos", "ganhos")
        .addSelect("idea.justificativa_analista", "justificativa_analista")
        .addSelect("idea.outros_ganhos", "outros_ganhos")
        .where("idea.id = :id", { id: Number(id) })
        .andWhere("idea.unidade_dass = :dassOffice", {
          dassOffice: validDassOffice,
        })
        .getRawOne<PenseAjaDetails>();

      if (!data) {
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }

      return {
        ...data,
        matricula: Number(data.matricula),
        super_producao: Number(data.super_producao),
        transporte: Number(data.transporte),
        processamento: Number(data.processamento),
        movimento: Number(data.movimento),
        estoque: Number(data.estoque),
        espera: Number(data.espera),
        talento: Number(data.talento),
        retrabalho: Number(data.retrabalho),
      };
    } catch (error) {
      logger.error("Pense-aja", `Erro ao consultar pense aja por ID: ${error}`);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao consultar pense aja.");
    }
  },

  async evaluatePenseAja(
    id: string,
    data: EvaluationData
  ): Promise<EvaluatePenseAjaResult> {
    const {
      dassOffice,
      status,
      usuario: avaliador,
      funcao,
      justificativa = "Sem justificativa.",
      avaliacao,
      a3Mae = "",
      emEspera,
      replicavel,
      actorRegistration,
      permissions,
    } = data;
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    const isManagerSlot = hasPermission(permissions, "idea.exclude");
    const role = isManagerSlot ? "gerente" : "analista";

    const EXCLUDE = "exclude";
    const REPROVE = "reprove";
    const CLASSIFICATION_MAP: Record<string, string> = {
      "1": "C",
      "2": "B",
      "3": "A",
    };

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (!hasPermission(permissions, "idea.evaluate")) {
        throw new CustomError(
          "Acesso proibido: permissão insuficiente para avaliar ideias.",
          403
        );
      }

      if (status === EXCLUDE && !hasPermission(permissions, "idea.exclude")) {
        throw new CustomError(
          "Somente Gerentes e Administradores podem excluir um registro pense e aja!",
          403,
          "Somente Gerentes e Administradores podem excluir um registro pense e aja!"
        );
      }

      if (status === REPROVE && avaliacao) {
        throw new CustomError(
          "Não é possível reprovar um Pense Aja com uma avaliação (A, B ou C).",
          400,
          "Não é possível reprovar um Pense Aja com uma avaliação (A, B ou C)."
        );
      }

      const ideaRepository = queryRunner.manager.getRepository(PenseAjaDassEntity);
      const pointsRepository = queryRunner.manager.getRepository(PenseAjaPontosEntity);
      const correlationId = randomUUID();

      const currentIdea = await ideaRepository.findOne({
        where: {
          id: Number(id),
          unidade_dass: validDassOffice,
          excluido: false,
        },
      });

      if (!currentIdea) {
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }

      const currentPoints = await pointsRepository.findOne({
        where: {
          id_pense_aja: String(currentIdea.id),
          matricula: String(currentIdea.matricula),
          unidade_dass: validDassOffice,
        },
      });

      const now = new Date();
      const updateData: Partial<PenseAjaDass> = {
        updatedat: now,
      };

      if (!isManagerSlot) {
        Object.assign(updateData, {
          status_analista: status,
          analista_avaliador: avaliador,
          data_avaanalista: now,
          justificativa_analista: justificativa,
        });
      } else {
        Object.assign(updateData, {
          status_gerente: status,
          gerente_aprovador: avaliador,
          data_aprogerente: now,
          justificativa_gerente: justificativa,
        });
      }

      if (status === EXCLUDE) {
        updateData.excluido = true;
      } else {
        Object.assign(updateData, {
          classificacao: avaliacao ?? null,
          a3_mae: a3Mae,
          em_espera: toFlag(emEspera),
          replicavel: toFlag(replicavel),
        });
      }

      const updateResult = await ideaRepository.update(
        {
          id: Number(id),
          unidade_dass: validDassOffice,
          excluido: false,
        },
        updateData as any
      );

      if (!updateResult.affected) {
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }

      const newEvaluation = await ideaRepository.findOne({
        where: {
          id: Number(id),
          unidade_dass: validDassOffice,
        },
      });

      if (!newEvaluation) {
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }

      const classificacao = CLASSIFICATION_MAP[String(avaliacao ?? "")] ?? "C";

      if (currentPoints && (status === EXCLUDE || status === REPROVE)) {
        await LedgerService.createEntry(queryRunner, {
          registration: String(newEvaluation.matricula),
          dassOffice: validDassOffice,
          entryType: "reverse",
          amount: Number(currentPoints.valor),
          sourceType: "idea_evaluation",
          sourceId: String(newEvaluation.id),
          relatedEntryId: currentPoints.id,
          correlationId,
          reason: justificativa,
          createdByRegistration: actorRegistration ?? null,
          createdByName: avaliador,
          metadata: { status },
        });

        await pointsRepository.delete({
          id_pense_aja: String(newEvaluation.id),
          matricula: String(newEvaluation.matricula),
          unidade_dass: validDassOffice,
        });
      }

      if (status !== EXCLUDE && status !== REPROVE && avaliacao) {
        if (currentPoints) {
          if (Number(currentPoints.valor) !== Number(avaliacao)) {
            await LedgerService.createEntry(queryRunner, {
              registration: String(newEvaluation.matricula),
              dassOffice: validDassOffice,
              entryType: "reverse",
              amount: Number(currentPoints.valor),
              sourceType: "idea_evaluation",
              sourceId: String(newEvaluation.id),
              relatedEntryId: currentPoints.id,
              correlationId,
              reason: "Reavaliação de pontuação.",
              createdByRegistration: actorRegistration ?? null,
              createdByName: avaliador,
              metadata: { previousScore: Number(currentPoints.valor) },
            });
          }

          await pointsRepository
            .createQueryBuilder()
            .update()
            .set({
              valor: String(avaliacao),
              classificacao,
              updatedat: now,
            })
            .where("id_pense_aja = :idPenseAja", {
              idPenseAja: String(newEvaluation.id),
            })
            .execute();
        } else {
          await pointsRepository.save(
            pointsRepository.create({
              id_pense_aja: String(newEvaluation.id),
              matricula: String(newEvaluation.matricula),
              nome: newEvaluation.nome,
              valor: String(avaliacao),
              gerente: newEvaluation.gerente,
              classificacao,
              createdat: now,
              updatedat: now,
              unidade_dass: validDassOffice,
            })
          );
        }

        if (!currentPoints || Number(currentPoints.valor) !== Number(avaliacao)) {
          await LedgerService.createEntry(queryRunner, {
            registration: String(newEvaluation.matricula),
            dassOffice: validDassOffice,
            entryType: "earn",
            amount: Number(avaliacao),
            sourceType: "idea_evaluation",
            sourceId: String(newEvaluation.id),
            correlationId,
            reason: justificativa,
            createdByRegistration: actorRegistration ?? null,
            createdByName: avaliador,
            metadata: {
              classificacao,
              role,
            },
          });
        }
      }

      await LedgerService.syncBalanceProjection(
        queryRunner,
        String(newEvaluation.matricula),
        validDassOffice
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: "idea.evaluated",
        aggregateType: "idea",
        aggregateId: newEvaluation.id,
        dassOffice: validDassOffice,
        actorRegistration: actorRegistration ?? null,
        actorRole: funcao,
        reason: justificativa,
        beforeState: mapIdeaAuditState(currentIdea),
        afterState: mapIdeaAuditState(newEvaluation),
        metadata: {
          status,
          avaliacao: avaliacao ? Number(avaliacao) : null,
          role,
        },
        correlationId,
      });

      await queryRunner.commitTransaction();
      return { newEvaluation: mapEvaluationRow(newEvaluation), role };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error("PenseAjaService", `Erro ao avaliar Pense Aja: ${error}`);
      throw error instanceof CustomError
        ? error
        : new CustomError("Erro ao avaliar Pense Aja.");
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async evaluatePenseAjaWithNotification(
    id: string,
    data: EvaluationData
  ): Promise<EvaluatePenseAjaResponse> {
    const { newEvaluation, role } = await this.evaluatePenseAja(id, data);
    const userEmail = await UserPenseaja.getUserEmail(
      newEvaluation.matricula,
      data.dassOffice
    );

    let avaliadorNome;
    if (role.includes("gerente")) {
      avaliadorNome = (newEvaluation.gerente_aprovador ?? "")
        .split(".")
        .map(
          (part: string) =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");
    } else {
      avaliadorNome = (newEvaluation.analista_avaliador ?? "")
        .split(".")
        .map(
          (part: string) =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");
    }

    const notificationEnabled = await NotificationService.isNotificationEnabled(
      newEvaluation.matricula,
      data.dassOffice
    );

    if (userEmail && notificationEnabled) {
      await NotificationService.sendNotification({
        to: userEmail.email,
        subject: "Aplicativo Pense Aja",
        title: "Pense Aja Avaliado.",
        message: `Seu registro de Pense Aja foi avaliado${
          avaliadorNome ? ` pelo usuário ${avaliadorNome}` : "!"
        }. 
        Abra o aplicativo e veja sua pontuação e feedbacks!`,
        application: "Pense e Aja",
        link: `${appBaseUrl}/pense-aja/${id}`,
      });
    }

    return {
      message: "Pense Aja avaliado com sucesso!",
      data: newEvaluation,
    };
  },

  async buyProduct(
    dassOffice: string,
    product: PurchaseProductPayload["product"],
    colaboradorData: PurchaseProductPayload["colaboradorData"],
    analista: PurchaseProductPayload["analista"],
    userPoints: UserPointsBalance & { saldo_disponivel?: number },
    actorRegistration?: string,
    actorName?: string
  ): Promise<number> {
    const validDassOffice = assertDassOffice(dassOffice);
    const pontosRestantes =
      userPoints.saldo_disponivel ??
      userPoints.pontos - userPoints.pontos_resgatados;
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const productRepository = queryRunner.manager.getRepository(PenseAjaLojaEntity);
      const prizeRepository = queryRunner.manager.getRepository(PenseAjaPremiosEntity);

      const getProduct = await productRepository.findOne({
        where: {
          id: Number(product.id),
          unidade_dass: validDassOffice,
        },
      });

      if (!getProduct) {
        throw new CustomError(
          "Produto não encontrado.",
          404,
          "Produto não encontrado."
        );
      }

      if (pontosRestantes < getProduct.valor) {
        throw new CustomError(
          "Pontos insuficientes para resgatar o prêmio.",
          400,
          "Pontos insuficientes para resgatar o prêmio."
        );
      }

      await queryRunner.startTransaction();
      const now = new Date();
      const correlationId = randomUUID();
      const operatorRegistration =
        actorRegistration ?? analista.analistaUser ?? null;
      const operatorName = actorName ?? analista.analistaName ?? "";

      const reserveEntry = await LedgerService.createEntry(queryRunner, {
        registration: String(colaboradorData.matricula),
        dassOffice: validDassOffice,
        entryType: "reserve",
        amount: Number(getProduct.valor),
        sourceType: "reward_redemption",
        sourceId: `product:${getProduct.id}`,
        correlationId,
        reason: "Reserva de saldo para resgate legado.",
        createdByRegistration: operatorRegistration,
        createdByName: operatorName,
        metadata: {
          catalogItemId: Number(getProduct.id),
          fulfillmentType: "legacy_instant",
        },
      });

      const redemptionRepository = queryRunner.manager.getRepository(
        MarketplaceRedemptionRequestEntity
      );
      const redemptionRequest = await redemptionRepository.save(
        redemptionRepository.create({
          matricula: String(colaboradorData.matricula),
          unidade_dass: validDassOffice,
          catalog_item_id: String(getProduct.id),
          request_status: "legacy_completed",
          reserved_ledger_entry_id: String(reserveEntry.id),
          approval_actor_registration: operatorRegistration,
          approval_actor_name: operatorName,
          fulfillment_type: "legacy_instant",
          legacy_prize_id: null,
          createdat: now,
          updatedat: now,
        })
      );

      const prize = await prizeRepository.save(
        prizeRepository.create({
          matricula: String(colaboradorData.matricula),
          nome: colaboradorData.nome,
          premio_solicitado: getProduct.nome,
          pontos_premio_solicitado: String(getProduct.valor),
          usuario_entregador: operatorRegistration ?? "",
          nome_entregador: operatorName ?? "",
          data_solicitacao: now,
          data_entrega: now,
          createdat: now,
          updatedat: now,
          unidade_dass: validDassOffice,
        })
      );

      await LedgerService.createEntry(queryRunner, {
        registration: String(colaboradorData.matricula),
        dassOffice: validDassOffice,
        entryType: "commit",
        amount: Number(getProduct.valor),
        sourceType: "reward_redemption",
        sourceId: String(redemptionRequest.id),
        relatedEntryId: reserveEntry.id,
        correlationId,
        reason: "Confirmação de resgate legado.",
        createdByRegistration: operatorRegistration,
        createdByName: operatorName,
        metadata: {
          legacyPrizeId: Number(prize.id),
          catalogItemId: Number(getProduct.id),
        },
      });

      await redemptionRepository.update(
        { id: redemptionRequest.id },
        {
          legacy_prize_id: String(prize.id),
          updatedat: new Date(),
        }
      );

      await LedgerService.syncBalanceProjection(
        queryRunner,
        String(colaboradorData.matricula),
        validDassOffice
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: "reward.redemption.legacy_completed",
        aggregateType: "reward_redemption",
        aggregateId: redemptionRequest.id,
        dassOffice: validDassOffice,
        actorRegistration: operatorRegistration,
        actorRole: "marketplace_operator",
        reason: "Resgate legado confirmado.",
        beforeState: null,
        afterState: {
          request_status: "legacy_completed",
          catalog_item_id: Number(getProduct.id),
          legacy_prize_id: Number(prize.id),
        },
        metadata: {
          productName: getProduct.nome,
          points: Number(getProduct.valor),
        },
        correlationId,
      });

      await queryRunner.commitTransaction();
      return Number(prize.id);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error("Pense-aja", `Erro ao comprar produto: ${error}`);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao comprar produto.");
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async purchaseProductByRegistration(
    registration: number,
    {
      product,
      colaboradorData,
      analista,
      dassOffice,
      actorRegistration,
      actorName,
    }: PurchaseProductPayload
  ): Promise<PurchaseProductResponse> {
    const user = await UserPenseaja.getUserData(registration, dassOffice);
    if (!user) {
      throw new CustomError(
        "Erro ao resgatar produto! Usuário não encontrado.",
        400
      );
    }

    const userPoints = {
      pontos: user.pontos,
      pontos_resgatados: user.pontos_resgatados,
      saldo_disponivel: user.saldo_disponivel,
    };
    const result = await this.buyProduct(
      dassOffice,
      product,
      colaboradorData,
      analista,
      userPoints,
      actorRegistration,
      actorName
    );

    return {
      message: "Produto Resgatado com sucesso!",
      data: result,
    };
  },

  async getIdeaAuditTimeline(id: string, dassOffice: string) {
    return AuditService.getIdeaAuditTimeline(id, assertDassOffice(dassOffice));
  },

  async createProduct(
    dassOffice: string,
    productData: NewProduct,
    files: UploadFileReference[],
    userRegistration: string
  ): Promise<string> {
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const image = files[0].fileUrl;
      const now = new Date();
      const productRepository = queryRunner.manager.getRepository(PenseAjaLojaEntity);

      const product = await productRepository.save(
        productRepository.create({
          nome: productData.name,
          imagem: image,
          valor: productData.points,
          unidade_dass: validDassOffice,
          user_create: userRegistration,
          created_at: now,
          updated_at: now,
        })
      );

      await queryRunner.commitTransaction();
      return product.nome;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error("Store", `Erro ao cadastrar novo produto: ${error}`);

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao cadastrar novo produto.");
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async fetchProducts(dassOffice: string): Promise<ProductRecord[]> {
    const validDassOffice = assertDassOffice(dassOffice);

    try {
      const dataSource = await initializeDatabase();
      const products = await dataSource
        .getRepository(PenseAjaLojaEntity)
        .createQueryBuilder("product")
        .select("product.id", "id")
        .addSelect("product.nome", "nome")
        .addSelect("product.imagem", "imagem")
        .addSelect("product.valor", "valor")
        .addSelect("product.user_create", "user_create")
        .addSelect("product.created_at", "created_at")
        .where("product.unidade_dass = :dassOffice", {
          dassOffice: validDassOffice,
        })
        .getRawMany<ProductRecord>();

      return products.map((product) => ({
        ...product,
        id: Number(product.id),
        valor: Number(product.valor),
      }));
    } catch (error) {
      logger.error("Pense-aja", `Erro ao buscar produtos: ${error}`);
      throw new CustomError("Erro ao buscar produtos.");
    }
  },

  async updateProduct(
    productData: ProductUpdateInput[],
    dassOffice: string,
    usuario: string
  ): Promise<ProductRecord[]> {
    const validDassOffice = assertDassOffice(dassOffice);

    if (!Array.isArray(productData) || productData.length === 0) {
      throw new CustomError(
        "Dados inválidos.",
        400,
        "É necessário fornecer pelo menos um produto para atualização."
      );
    }

    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const productRepository = queryRunner.manager.getRepository(PenseAjaLojaEntity);
      const updatedProducts: ProductRecord[] = [];
      const failedProducts: Array<{ id: number; error: string }> = [];

      for (const product of productData) {
        if (!product.id || !product.nome || product.valor === undefined) {
          failedProducts.push({ id: product.id, error: "Dados incompletos" });
          continue;
        }

        const existingProduct = await productRepository.findOne({
          where: {
            id: Number(product.id),
            unidade_dass: validDassOffice,
          },
        });

        if (!existingProduct) {
          failedProducts.push({
            id: product.id,
            error: "Produto não encontrado ou não pertence à unidade informada",
          });
          continue;
        }

        const result = await productRepository
          .createQueryBuilder()
          .update()
          .set({
            nome: product.nome,
            valor: product.valor,
            updated_at: new Date(),
            updated_by: usuario,
          })
          .where("id = :id", { id: Number(product.id) })
          .andWhere("unidade_dass = :dassOffice", {
            dassOffice: validDassOffice,
          })
          .returning(["id", "nome", "imagem", "valor"])
          .execute();

        if (result.raw?.length) {
          updatedProducts.push({
            ...result.raw[0],
            id: Number(result.raw[0].id),
            valor: Number(result.raw[0].valor),
          });
        } else {
          failedProducts.push({ id: product.id, error: "Falha ao atualizar" });
        }
      }

      if (updatedProducts.length === 0) {
        await queryRunner.rollbackTransaction();
        throw new CustomError(
          "Nenhum produto foi atualizado.",
          400,
          failedProducts.length > 0
            ? `Erros: ${JSON.stringify(failedProducts)}`
            : "Verifique os dados enviados."
        );
      }

      await queryRunner.commitTransaction();
      logger.info(
        "Store",
        `${updatedProducts.length} produtos atualizados com sucesso para a unidade ${validDassOffice}`
      );

      return updatedProducts;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error("Store", `Erro ao atualizar produtos: ${error}`);

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        "Erro ao atualizar produtos.",
        500,
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },
};
