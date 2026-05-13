import { randomUUID } from "crypto";
import { QueryRunner } from "typeorm";
import { initializeDatabase } from "../config/database";
import MarketplaceRedemptionRequestEntity from "../models/MarketplaceRedemptionRequest";
import PenseAjaDassEntity, { PenseAjaDass } from "../models/PenseAjaDass";
import MarketplaceCatalogItemEntity from "../models/MarketplaceCatalogItem";
import logger from "../utils/logger";
import { assertDassOffice } from "../utils/dassOffice";
import { CustomError } from "../types/CustomError";
import { UserPenseaja } from "./user-penseaja.service";
import { AuditService } from "./audit.service";
import { LedgerService } from "./ledger.service";
import { DomainEventNotificationService } from "./domain-event-notification.service";
import { EvaluationWorkflowService } from "./evaluation-workflow.service";
import { UnitSettingsService } from "./unit-settings.service";
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

const LEGACY_CLASSIFICATION_MAP: Record<string, string> = {
  "1": "C",
  "2": "B",
  "3": "A",
};

const normalizeClassification = (classification?: string, legacyValue?: string) => {
  if (classification) {
    return classification.trim().toUpperCase();
  }
  return LEGACY_CLASSIFICATION_MAP[String(legacyValue ?? "")] ?? null;
};

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
              .select("pontos.source_id", "id_pense_aja")
              .addSelect(
                "COALESCE(SUM(CASE WHEN pontos.entry_type = 'earn' THEN pontos.amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN pontos.entry_type = 'reverse' THEN pontos.amount ELSE 0 END), 0)",
                "valor"
              )
              .from("pense_aja.points_ledger_entries", "pontos")
              .where("pontos.unidade_dass = :dassOffice", {
                dassOffice: validDassOffice,
              })
              .andWhere("pontos.source_type = 'idea_evaluation'")
              .andWhere("pontos.status = 'confirmed'")
              .groupBy("pontos.source_id"),
          "points",
          "points.id_pense_aja = CAST(idea.id AS varchar)"
        )
        .where("idea.excluido = false")
        .andWhere("idea.unidade_dass = :dassOffice", {
          dassOffice: validDassOffice,
        });

      if (startDateParsed) {
        query.andWhere("idea.createdat >= :startDate", {
          startDate: startDateParsed,
        });
      }

      if (endDateParsed) {
        query.andWhere(
          "idea.createdat < (:endDate::timestamptz + interval '1 day')",
          {
            endDate: endDateParsed,
          }
        );
      }

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
    dassOffice: string,
    actor?: { actorRegistration?: string; actorName?: string }
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

      await AuditService.recordEvent(queryRunner, {
        eventType: "idea.created",
        aggregateType: "idea",
        aggregateId: savedIdea.id,
        dassOffice: validDassOffice,
        actorRegistration:
          actor?.actorRegistration ?? String(data.registration ?? ""),
        actorRole: "idea.submit",
        reason: "Cadastro de ideia.",
        beforeState: null,
        afterState: mapIdeaAuditState(savedIdea),
        metadata: {
          projectName: savedIdea.nome_projeto,
          requesterName: actor?.actorName ?? savedIdea.nome,
        },
        correlationId: randomUUID(),
      });

      await queryRunner.commitTransaction();

      return {
        pense_aja: {
          id: Number(savedIdea.id),
          nome: savedIdea.nome,
          nome_projeto: savedIdea.nome_projeto,
          ganhos: (savedIdea.ganhos as string[] | null) ?? null,
        },
        userManager: null,
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
    dassOffice: string,
    actor?: { actorRegistration?: string; actorName?: string }
  ): Promise<SubmitPenseAjaResponse> {
    const validDassOffice = assertDassOffice(dassOffice);
    const { pense_aja, duplicated } = await this.createPenseAja(
      data,
      dassOffice,
      actor
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

    const notificationResult = await DomainEventNotificationService.dispatch({
      type: "idea.created",
      idea: pense_aja,
      registration: data.registration,
      dassOffice: validDassOffice,
    });

    const message = notificationResult.notificationTargetFound
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
	      classification,
      a3Mae = "",
      emEspera,
      replicavel,
      actorRegistration,
      permissions,
    } = data;
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    const EXCLUDE = "exclude";
    const REPROVE = "reprove";

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const workflowDecision = await EvaluationWorkflowService.resolveDecision(
        queryRunner,
        validDassOffice,
        permissions
      );
      const role = workflowDecision.reviewSlot;

      if (status === EXCLUDE && !hasPermission(permissions, "idea.exclude")) {
        throw new CustomError(
          "Somente Gerentes e Administradores podem excluir um registro pense e aja!",
          403,
          "Somente Gerentes e Administradores podem excluir um registro pense e aja!"
        );
      }

	      if (status === REPROVE && (avaliacao || classification)) {
	        throw new CustomError(
	          "Não é possível reprovar um Pense Aja com uma avaliação (A, B ou C).",
          400,
          "Não é possível reprovar um Pense Aja com uma avaliação (A, B ou C)."
        );
      }

      const ideaRepository = queryRunner.manager.getRepository(PenseAjaDassEntity);
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

      const currentPoints = await LedgerService.getSourceNetAmount(queryRunner, {
        registration: String(currentIdea.matricula),
        dassOffice: validDassOffice,
        sourceType: "idea_evaluation",
        sourceId: String(currentIdea.id),
      });

	      const now = new Date();
	      const selectedClassification = normalizeClassification(
	        classification,
	        avaliacao
	      );
	      const updateData: Partial<PenseAjaDass> = {
	        updatedat: now,
	      };

      if (role !== "gerente") {
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
	          classificacao: selectedClassification,
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

	      const scoringRule = selectedClassification
	        ? await UnitSettingsService.getScoringRule(
	            queryRunner.manager,
	            validDassOffice,
	            selectedClassification
	          )
	        : null;

	      if (status !== EXCLUDE && status !== REPROVE && !scoringRule) {
	        throw new CustomError(
	          "Classificação de pontuação não configurada para esta unidade.",
	          400
	        );
	      }

	      const evaluationScore = scoringRule ? Number(scoringRule.score) : 0;

      if (currentPoints.netAmount > 0 && (status === EXCLUDE || status === REPROVE)) {
        await LedgerService.createEntry(queryRunner, {
          registration: String(newEvaluation.matricula),
          dassOffice: validDassOffice,
          entryType: "reverse",
          amount: currentPoints.netAmount,
          sourceType: "idea_evaluation",
          sourceId: String(newEvaluation.id),
          relatedEntryId: currentPoints.latestEarnEntryId,
          correlationId,
          reason: justificativa,
          createdByRegistration: actorRegistration ?? null,
          createdByName: avaliador,
          metadata: { status },
        });
      }

	      if (status !== EXCLUDE && status !== REPROVE && scoringRule) {
        if (currentPoints.netAmount > 0 && currentPoints.netAmount !== evaluationScore) {
          await LedgerService.createEntry(queryRunner, {
            registration: String(newEvaluation.matricula),
            dassOffice: validDassOffice,
            entryType: "reverse",
            amount: currentPoints.netAmount,
            sourceType: "idea_evaluation",
            sourceId: String(newEvaluation.id),
            relatedEntryId: currentPoints.latestEarnEntryId,
            correlationId,
            reason: "Reavaliação de pontuação.",
            createdByRegistration: actorRegistration ?? null,
            createdByName: avaliador,
            metadata: { previousScore: currentPoints.netAmount },
          });
        }

        if (currentPoints.netAmount !== evaluationScore) {
          await LedgerService.createEntry(queryRunner, {
            registration: String(newEvaluation.matricula),
            dassOffice: validDassOffice,
            entryType: "earn",
            amount: evaluationScore,
            sourceType: "idea_evaluation",
            sourceId: String(newEvaluation.id),
            correlationId,
            reason: justificativa,
            createdByRegistration: actorRegistration ?? null,
            createdByName: avaliador,
	            metadata: {
	              classification: selectedClassification,
	              role,
	              workflowStep: workflowDecision.stepCode,
	              requiredPermission: workflowDecision.requiredPermission,
	              scoringRuleId: scoringRule.id,
	              score: evaluationScore,
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
	          classification: selectedClassification,
	          score: scoringRule ? evaluationScore : null,
	          role,
          workflowStep: workflowDecision.stepCode,
          reviewSlot: workflowDecision.reviewSlot,
          requiredPermission: workflowDecision.requiredPermission,
          terminalStatus: workflowDecision.terminalStatus,
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
    await DomainEventNotificationService.dispatch({
      type: "idea.evaluated",
      ideaId: id,
      evaluation: newEvaluation,
      role,
      dassOffice: data.dassOffice,
    });

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
    void userPoints;
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const productRepository = queryRunner.manager.getRepository(
        MarketplaceCatalogItemEntity
      );

      const getProduct = await productRepository.findOne({
        where: [
          {
            id: String(product.id),
            unidade_dass: validDassOffice,
            active: true,
          },
          {
            legacy_product_id: String(product.id),
            unidade_dass: validDassOffice,
            active: true,
          },
        ],
      });

      if (!getProduct) {
        throw new CustomError(
          "Produto não encontrado.",
          404,
          "Produto não encontrado."
        );
      }

      await LedgerService.syncBalanceProjection(
        queryRunner,
        String(colaboradorData.matricula),
        validDassOffice
      );

      const balanceRows = (await queryRunner.query(
        `
          SELECT available_balance
          FROM pense_aja.points_balance_projection
          WHERE matricula = $1
            AND unidade_dass = $2
          FOR UPDATE
        `,
        [String(colaboradorData.matricula), validDassOffice]
      )) as Array<{ available_balance: string }>;
      const pontosRestantes = Number(balanceRows[0]?.available_balance ?? 0);

      if (pontosRestantes < Number(getProduct.points_cost)) {
        throw new CustomError(
          "Pontos insuficientes para resgatar o prêmio.",
          400,
          "Pontos insuficientes para resgatar o prêmio."
        );
      }

      const now = new Date();
      const correlationId = randomUUID();
      const operatorRegistration =
        actorRegistration ?? analista.analistaUser ?? null;
      const operatorName = actorName ?? analista.analistaName ?? "";

      const reserveEntry = await LedgerService.createEntry(queryRunner, {
        registration: String(colaboradorData.matricula),
        dassOffice: validDassOffice,
        entryType: "reserve",
        amount: Number(getProduct.points_cost),
        sourceType: "marketplace_redemption",
        sourceId: `catalog:${getProduct.id}`,
        correlationId,
        reason: "Reserva de saldo para resgate legado.",
        createdByRegistration: operatorRegistration,
        createdByName: operatorName,
        metadata: {
          catalogItemId: String(getProduct.id),
          fulfillmentType:
            getProduct.item_type === "voucher"
              ? "voucher_issue"
              : "physical_delivery",
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
          request_status: "completed",
          reserved_ledger_entry_id: String(reserveEntry.id),
          approval_actor_registration: operatorRegistration,
          approval_actor_name: operatorName,
          fulfillment_type:
            getProduct.item_type === "voucher"
              ? "voucher_issue"
              : "physical_delivery",
          legacy_prize_id: null,
          createdat: now,
          updatedat: now,
        })
      );

      await LedgerService.createEntry(queryRunner, {
        registration: String(colaboradorData.matricula),
        dassOffice: validDassOffice,
        entryType: "commit",
        amount: Number(getProduct.points_cost),
        sourceType: "marketplace_redemption",
        sourceId: String(redemptionRequest.id),
        relatedEntryId: reserveEntry.id,
        correlationId,
        reason: "Confirmação de resgate legado.",
        createdByRegistration: operatorRegistration,
        createdByName: operatorName,
        metadata: {
          catalogItemId: String(getProduct.id),
        },
      });

      await LedgerService.syncBalanceProjection(
        queryRunner,
        String(colaboradorData.matricula),
        validDassOffice
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: "marketplace.request.completed",
        aggregateType: "marketplace_redemption",
        aggregateId: redemptionRequest.id,
        dassOffice: validDassOffice,
        actorRegistration: operatorRegistration,
        actorRole: "marketplace_operator",
        reason: "Resgate legado confirmado.",
        beforeState: null,
        afterState: {
          request_status: "completed",
          catalog_item_id: String(getProduct.id),
        },
        metadata: {
          productName: getProduct.name,
          points: Number(getProduct.points_cost),
        },
        correlationId,
      });

      await queryRunner.commitTransaction();
      return Number(redemptionRequest.id);
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
      const productRepository = queryRunner.manager.getRepository(
        MarketplaceCatalogItemEntity
      );

      const product = await productRepository.save(
        productRepository.create({
          legacy_product_id: null,
          unidade_dass: validDassOffice,
          name: productData.name,
          image_url: image,
          points_cost: String(productData.points),
          item_type: "physical",
          active: true,
          available_quantity: null,
          metadata: null,
          created_by: userRegistration,
          updated_by: userRegistration,
          createdat: now,
          updatedat: now,
        })
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: "catalog.item.created",
        aggregateType: "catalog_item",
        aggregateId: product.id,
        dassOffice: validDassOffice,
        actorRegistration: userRegistration,
        actorRole: "catalog.manage",
        afterState: {
          name: product.name,
          points_cost: Number(product.points_cost),
          item_type: product.item_type,
        },
        correlationId: randomUUID(),
      });

      await queryRunner.commitTransaction();
      return product.name;
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
        .getRepository(MarketplaceCatalogItemEntity)
        .createQueryBuilder("product")
        .select("product.id", "id")
        .addSelect("product.name", "nome")
        .addSelect("product.image_url", "imagem")
        .addSelect("product.points_cost", "valor")
        .addSelect("product.created_by", "user_create")
        .addSelect("product.createdat", "created_at")
        .where("product.unidade_dass = :dassOffice", {
          dassOffice: validDassOffice,
        })
        .andWhere("product.active = true")
        .getRawMany<ProductRecord>();

      return products.map((product) => ({
        ...product,
        id: String(product.id),
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

      const productRepository = queryRunner.manager.getRepository(
        MarketplaceCatalogItemEntity
      );
      const updatedProducts: ProductRecord[] = [];
      const failedProducts: Array<{ id: string; error: string }> = [];

      for (const product of productData) {
        if (!product.id || !product.nome || product.valor === undefined) {
          failedProducts.push({ id: product.id, error: "Dados incompletos" });
          continue;
        }

        const existingProduct = await productRepository.findOne({
          where: {
            id: String(product.id),
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
            name: product.nome,
            points_cost: String(product.valor),
            updatedat: new Date(),
            updated_by: usuario,
          })
          .where("id = :id", { id: String(product.id) })
          .andWhere("unidade_dass = :dassOffice", {
            dassOffice: validDassOffice,
          })
          .returning(["id", "name", "image_url", "points_cost"])
          .execute();

        if (result.raw?.length) {
          await AuditService.recordEvent(queryRunner, {
            eventType: "catalog.item.updated",
            aggregateType: "catalog_item",
            aggregateId: product.id,
            dassOffice: validDassOffice,
            actorRegistration: usuario,
            actorRole: "catalog.manage",
            beforeState: {
              name: existingProduct.name,
              points_cost: Number(existingProduct.points_cost),
            },
            afterState: {
              name: result.raw[0].name,
              points_cost: Number(result.raw[0].points_cost),
            },
            correlationId: randomUUID(),
          });

          updatedProducts.push({
            nome: result.raw[0].name,
            imagem: result.raw[0].image_url,
            valor: Number(result.raw[0].points_cost),
            id: String(result.raw[0].id),
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
