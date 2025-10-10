import logger from "../utils/logger";
import pool from "../config/db";
import { CustomError } from "../types/CustomError";
import { UserPenseaja } from "./UserPenseaja";
import penseAjaProducts from "../utils/penseAjaProducts.json"

const checkDassOffice = (dassOffice: string) => {
  const allowedOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];
  if (!allowedOffices.includes(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

interface PenseAjaData {
  nome: string;
  createDate: string | Date;
  situationBefore: string;
  situationNow: string;
  registration: string | number;
  perdas: Array<string>;
  userName: string;
  gerente: string;
  setor: string;
  turno: string;
  a3Mae?: string;
  valorA?: string;
  valorB?: string;
  valorAmortizado?: string;
  outrosGanhos?: string;
  ganhos?: Array<string>;
  ganhoDetalhes?: string;
  areaMelhoria: string;
  factory: string
}

interface EvaluationData {
  avaliacao: string;
  emEspera: boolean;
  replicavel: boolean;
  justificativa: string;
  usuario: string;
  avaliadoAnteriormente: boolean;
  nome: string;
  funcao: string;
  dassOffice: string;
  status: string;
  a3Mae?: string;
}

interface NewProduct {
  name: string;
  points: number;
  image: string;
}

const turnoMap: Record<string, string> = {
  A: "1° Turno",
  B: "2° Turno",
  C: "3° Turno",
};

export const PenseAjaService = {
  async fetchPenseAja(dassOffice: string, startDateParsed: Date, endDateParsed: Date, name: string, sector: string, manager: string, project: string, turno: string, status: string) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();
    try {
      let params = []
      let filters = []

      params.push(startDateParsed)
      params.push(endDateParsed)
      params.push(dassOffice)

      if (name) {
        filters.push(` nome = $${params.length + 1} `);
        params.push(name);
      }
      if (sector) {
        filters.push(` setor = $${params.length + 1} `);
        params.push(sector);
      }
      if (manager) {
        filters.push(` gerente = $${params.length + 1} `);
        params.push(manager);
      }
      if (project) {
        filters.push(` nome_projeto = $${params.length + 1} `);
        params.push(project);
      }
      if (turno) {
        let turnoValue;
        if (turno === "1° Turno") {
          turnoValue = "A";
        } else if (turno === "2° Turno") {
          turnoValue = "B";
        } else {
          turnoValue = "C";
        }
        filters.push(` turno = $${params.length + 1}`);
        params.push(turnoValue);
      }
      if (status) {
        filters.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      let baseQuery = `
        SELECT
          id,
          data_realizada AS criado,
          fabrica,
          nome,
          setor,
          gerente,
          nome_projeto,
          turno,
          situacao_anterior,
          situacao_atual,
          ganhos,
          outros_ganhos,
          gerente_aprovador,
          analista_avaliador,
          status_gerente,
          status_analista,
          em_espera,
          createdat,
          classificacao
        FROM
          pense_aja.pense_aja_dass
       WHERE
          excluido = false
          AND createdat >= $1
          AND createdat < ($2::timestamptz + interval '1 day')
          AND unidade_dass = $3
      `

      if (filters.length > 0) {
        baseQuery = baseQuery.concat(` AND ${filters.join(" AND ")}`);
      }
      baseQuery = baseQuery.concat(` ORDER BY createdat DESC`);

      const result = await client.query(baseQuery, params)

      const dados = result.rows;
      dados.forEach((row) => {
        row.criado = formatDate(row.criado);
        row.turno = turnoMap[row.turno] || "Comercial";
      });

      return dados;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido!";

      logger.error(
        "Pense-aja",
        `Erro ao consultar registros da tabela inicial: ${errorMessage}`
      );
      throw error;
    } finally {
      await client.release();
    }
  },

  async createPenseAja(data: PenseAjaData, dassOffice: string) {
    checkDassOffice(dassOffice);

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
      "factory"
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes ou inválidos: ${missingFields.join(", ")}`);
    }

    if (!data.perdas) {
      data.perdas = [];
    }

    const perdasLean: Record<string, string> = {
      Superprodução: "super_producao",
      Transporte: "transporte",
      Processamento: "processamento",
      Movimento: "movimento",
      Estoque: "estoque",
      Espera: "espera",
      Talento: "talento",
      Retrabalho: "retrabalho",
    };

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Idempotency lock per (matricula, nome_projeto, data_realizada, unidade_dass)
      // Prevents concurrent duplicate inserts when user double-clicks with slow network
      await client.query(
        `SELECT pg_advisory_xact_lock(hashtext($1 || $2), hashtext($3 || $4))`,
        [
          String(data.registration ?? ''),
          String(data.nome ?? ''),
          String(data.createDate ?? ''),
          String(dassOffice ?? ''),
        ]
      );

      // Quick duplicate check within a short window
      const dupCheck = await client.query(
        `SELECT id, nome, nome_projeto, ganhos
           FROM pense_aja.pense_aja_dass
          WHERE matricula = $1
            AND nome_projeto = $2
            AND data_realizada = $3
            AND unidade_dass = $4
            AND excluido = false
          ORDER BY id DESC
          LIMIT 1`,
        [
          data.registration,
          data.nome,
          data.createDate,
          dassOffice,
        ]
      );
      if (dupCheck.rows.length > 0) {
        await client.query("COMMIT");
        return { pense_aja: dupCheck.rows[0], userManager: null, duplicated: true } as any;
      }

      const perdasSelecionads = new Set(data.perdas);
      const colunasPerdas = Object.keys(perdasLean);
      // Atualiza dados de seleção
      const perdasValores = colunasPerdas.map((perda) =>
        perdasSelecionads.has(perda) ? 1 : 0
      );

      // Parâmetros
      const params = [
        data.registration,
        data.userName,
        data.turno,
        data.setor,
        data.gerente,
        data.nome,
        data.createDate,
        data.situationBefore,
        data.situationNow,
        ...perdasValores,
        data.a3Mae || "",
        JSON.stringify(data.ganhos),
        data.ganhoDetalhes || "",
        data.areaMelhoria,
        dassOffice,
        data.factory
      ];

      const newPenseAja = await client.query(
        `
        INSERT INTO pense_aja.pense_aja_dass (
          matricula, nome, turno, setor, gerente, nome_projeto, data_realizada,
          situacao_anterior, situacao_atual, super_producao, transporte, processamento, movimento,
          estoque, espera, talento, retrabalho, a3_mae, ganhos, outros_ganhos, setor_melhoria, unidade_dass, 
          createdat, updatedat, lider, fabrica
        ) VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW(), '', $23)
        RETURNING id, nome, nome_projeto, ganhos;`,
        params
      );

      if (newPenseAja.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new CustomError(
          "Erro ao registrar pense aja.",
          400,
          "Erro ao inserir no banco de dados."
        );
      }

      const userManager = await UserPenseaja.getManagerByUser(data.registration, dassOffice);

      await client.query("COMMIT");
      return { pense_aja: newPenseAja.rows[0], userManager, duplicated: false } as any;
    } catch (error) {
      await client.query("ROLLBACK");
      const messageError =
        error instanceof Error ? error.message : "Erro desconhecido!";
      logger.error("Pense-aja", `Erro ao registrar pense aja: ${messageError}`);

      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError("Erro ao registrar pense aja.");
      }
    } finally {
      client.release();
    }
  },

  async getPenseAjaById(id: string, dassOffice: string) {
    checkDassOffice(dassOffice);
    const client = await pool.connect();

    try {
      const data = await client.query(
        `
        SELECT  
          matricula, nome, setor, turno, gerente, data_realizada as criado,
          situacao_anterior, situacao_atual, nome_projeto, super_producao, transporte, 
          processamento, movimento, estoque, espera, talento, retrabalho, gerente_aprovador, 
          data_aprogerente, analista_avaliador, classificacao, a3_mae, fabrica, ganhos, justificativa_analista, outros_ganhos
        FROM 
          pense_aja.pense_aja_dass
        WHERE id = $1 AND unidade_dass = $2`,
        [id, dassOffice]
      );

      if (data.rows.length === 0) {
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }

      return data.rows[0];
    } catch (error) {
      logger.error("Pense-aja", `Erro ao consultar pense aja por ID: ${error}`);
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError("Erro ao consultar pense aja.");
      }
    } finally {
      await client.release();
    }
  },

  async evaluatePenseAja(
    id: string,
    {
      dassOffice,
      status,
      usuario: avaliador,
      funcao,
      justificativa = 'Sem justificativa.',
      avaliacao,
      a3Mae = '',
      emEspera,
      replicavel,
      avaliadoAnteriormente = false
    }: EvaluationData
  ) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();

    // role detection
    const role = funcao.toLowerCase();
    const isAnalista = role.includes('analista');
    const isGerente = role.includes('gerente');
    const isAdmin = role.includes('automacao');

    // constants for clarity
    const EXCLUDE = 'exclude';
    const REPROVE = 'reprove';
    const CLASSIFICATION_MAP: Record<string, string> = {
      '1': 'C',
      '2': 'B',
      '3': 'A'
    };

    try {
      await client.query('BEGIN');

      // only managers and admins can delete
      if (status === EXCLUDE && !(isGerente || isAdmin)) {
        throw new CustomError(
          'Somente Gerentes e Administradores podem excluir um registro pense e aja!',
          403,
          'Somente Gerentes e Administradores podem excluir um registro pense e aja!'
        );
      }

      // Evitar inconsistências de status
      else if (status === REPROVE && avaliacao) {
        throw new CustomError(
          'Não é possível reprovar um Pense Aja com uma avaliação (A, B ou C).',
          400,
          'Não é possível reprovar um Pense Aja com uma avaliação (A, B ou C).'
        );
      }

      // build SET clauses and parameters
      const clauses: string[] = [];
      const params: Array<string | boolean> = [];
      let idx = 1;

      // role‐specific fields
      if (isAnalista) {
        clauses.push(
          `status_analista      = $${idx}`,
          `analista_avaliador   = $${idx + 1}`,
          `data_avaanalista     = NOW()`,
          `justificativa_analista = $${idx + 2}`
        );
        params.push(status, avaliador, justificativa);
        idx += 3;
      } else {
        clauses.push(
          `status_gerente       = $${idx}`,
          `gerente_aprovador    = $${idx + 1}`,
          `data_aprogerente     = NOW()`,
          `justificativa_gerente = $${idx + 2}`
        );
        params.push(status, avaliador, justificativa);
        idx += 3;
      }

      // status‐dependent fields
      if (status === EXCLUDE) {
        clauses.push(`excluido = true`);
      } else {
        clauses.push(
          `classificacao = $${idx}`,
          `a3_mae        = $${idx + 1}`,
          `em_espera     = $${idx + 2}`,
          `replicavel    = $${idx + 3}`
        );
        params.push(avaliacao, a3Mae, emEspera, replicavel);
        idx += 4;
      }

      // always update timestamp
      clauses.push(`updatedat = NOW()`);

      // WHERE clause
      const whereSql = `id = $${idx} AND unidade_dass = $${idx + 1} AND excluido = false`;
      params.push(id, dassOffice);

      const sql = `
        UPDATE pense_aja.pense_aja_dass
        SET ${clauses.join(', ')}
        WHERE ${whereSql}
        RETURNING
          id,
          data_realizada,
          fabrica,
          nome,
          matricula,
          setor,
          gerente,
          nome_projeto,
          turno,
          situacao_anterior,
          situacao_atual,
          gerente_aprovador,
          analista_avaliador,
          status_gerente,
          status_analista,
          em_espera,
          createdat AS criado;
    `;


      const result = await client.query(sql, params);
      if (result.rowCount === 0) {
        throw new CustomError('Pense Aja não encontrado.', 404, 'Pense Aja não encontrado.');
      }

      // Delete points if excluded or reproved by manager
      if ((status === EXCLUDE || status === REPROVE) && isGerente) {
        await client.query(
          `DELETE FROM pense_aja.pense_aja_pontos
         WHERE id_pense_aja = $1 AND matricula = $2`,
          [id, result.rows[0].matricula]
        );
      }

      // map numeric evaluation to letter grade
      const classificacao =
        status !== EXCLUDE
          ? CLASSIFICATION_MAP[avaliacao?.toString() ?? ''] ?? 'C'
          : CLASSIFICATION_MAP[avaliacao?.toString() ?? ''] ?? 'C';

      if (status !== EXCLUDE && status !== REPROVE && classificacao && avaliacao) {
        // Verifica se já existe pontuação para este Pense Aja
        // Se existir, substitui
        if (avaliadoAnteriormente) {
          await client.query(`
           UPDATE pense_aja.pense_aja_pontos
           SET valor = $1, classificacao = $2
           WHERE id_pense_aja = $3
          `, [avaliacao, classificacao, result.rows[0].id])

          console.log('Pense aja ja avaliado, atualizado valor e classificação');
        } else {
          // insert new points record
          await client.query(
            `
              INSERT INTO pense_aja.pense_aja_pontos
                (id_pense_aja, matricula, nome, valor, gerente, classificacao, createdat, updatedat, unidade_dass)
              VALUES
                ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
              RETURNING id;
            `,
            [
              result.rows[0].id,
              result.rows[0].matricula,
              result.rows[0].nome,
              avaliacao ?? 0,
              result.rows[0].gerente,
              classificacao,
              dassOffice
            ]
          );
        }
      }

      await client.query('COMMIT');
      return { newEvaluation: result.rows[0], role };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('PenseAjaService', `Erro ao avaliar Pense Aja: ${error}`);
      throw error instanceof CustomError
        ? error
        : new CustomError('Erro ao avaliar Pense Aja.');
    } finally {
      client.release();
    }
  },

  async buyProduct(dassOffice: string, product: Record<string, any>, colaboradorData: Record<string, any>, analista: Record<string, any>, userPoints: Record<string, any>) {
    checkDassOffice(dassOffice);

    const pontosRestantes = userPoints.pontos - userPoints.pontos_resgatados;

    const client = await pool.connect();
    try {
      const products = await client.query(`
        SELECT * FROM pense_aja.pense_aja_loja
      `)

      const getProduct = products.rows.find((p) => p.id === product.id);
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

      await client.query("BEGIN");

      const params = [
        colaboradorData.matricula,
        colaboradorData.nome,
        getProduct.nome,
        getProduct.valor,
        analista.analistaUser,
        analista.analistaName,
        dassOffice,
      ];

      const query = await client.query(`
        INSERT INTO 
        pense_aja.pense_aja_premios
          (matricula, nome, premio_solicitado, pontos_premio_solicitado, usuario_entregador, nome_entregador, 
          data_solicitacao, data_entrega, createdat, updatedat, unidade_dass)  
        VALUES 
          ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW(), NOW(), $7)
        RETURNING id
      `, params)

      if (query.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new CustomError(
          "Erro ao registrar prêmio.",
          400,
          "Erro ao inserir no banco de dados."
        );
      }

      await client.query("COMMIT");
      return query?.rows[0]?.id
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Pense-aja", `Erro ao comprar produto: ${error}`);
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError("Erro ao comprar produto.");
      }
    } finally {
      client.release();
    }
  },

  async createProduct(dassOffice: string, productData: NewProduct, files: Record<any, any>[], userRegistration: string) {
    checkDassOffice(dassOffice);

    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      const image = files[0].fileUrl

      const product = await client.query(`
        INSERT INTO pense_aja.pense_aja_loja (nome, imagem, valor, unidade_dass, user_create)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING nome;
      `, [productData.name, image, productData.points, dassOffice, userRegistration])

      if (product.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new CustomError(
          "Erro ao cadastrar novo produto.",
          400,
          "Erro ao inserir no banco de dados."
        );
      }

      await client.query("COMMIT");
      return product.rows[0].nome;
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Store", `Erro ao cadastrar novo produto: ${error}`);

      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError("Erro ao cadastrar novo produto.");
      }
    } finally {
      client.release()
    }
  },

  async fetchProducts(dassOffice: string) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();
    try {
      const products = await client.query(`
        SELECT 
          id, nome, imagem, valor, user_create, created_at 
        FROM 
          pense_aja.pense_aja_loja 
        WHERE 
          unidade_dass = $1
      `, [dassOffice]);

      return products.rows;
    } catch (error) {
      logger.error("Pense-aja", `Erro ao buscar produtos: ${error}`);
      throw new CustomError("Erro ao buscar produtos.");
    } finally {
      client.release();
    }
  },

  async updateProduct(productData: Array<{ id: number, nome: string, valor: number }>, dassOffice: string, usuario: string) {
    checkDassOffice(dassOffice);

    if (!Array.isArray(productData) || productData.length === 0) {
      throw new CustomError("Dados inválidos.", 400, "É necessário fornecer pelo menos um produto para atualização.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updatedProducts = [];
      const failedProducts = [];

      // Processar cada produto individualmente
      for (const product of productData) {
        if (!product.id || !product.nome || product.valor === undefined) {
          failedProducts.push({ id: product.id, error: "Dados incompletos" });
          continue;
        }

        // Verificar se o produto existe e pertence a unidade correta
        const verifyProduct = await client.query(
          `SELECT id FROM pense_aja.pense_aja_loja 
           WHERE id = $1 AND unidade_dass = $2`,
          [product.id, dassOffice]
        );

        if (verifyProduct.rowCount === 0) {
          failedProducts.push({ id: product.id, error: "Produto não encontrado ou não pertence à unidade informada" });
          continue;
        }

        // Atualizar o produto
        const result = await client.query(
          `UPDATE pense_aja.pense_aja_loja 
           SET nome = $1, valor = $2, updated_at = NOW(), updated_by = $3
           WHERE id = $4 AND unidade_dass = $5
           RETURNING id, nome, imagem, valor`,
          [product.nome, product.valor, usuario, product.id, dassOffice]
        );

        if (result.rows && result.rows.length > 0) {
          updatedProducts.push(result.rows[0]);
        } else {
          failedProducts.push({ id: product.id, error: "Falha ao atualizar" });
        }
      }

      // Se nenhum produto foi atualizado com sucesso, reverter a transação
      if (updatedProducts.length === 0) {
        await client.query("ROLLBACK");
        throw new CustomError(
          "Nenhum produto foi atualizado.",
          400,
          failedProducts.length > 0
            ? `Erros: ${JSON.stringify(failedProducts)}`
            : "Verifique os dados enviados."
        );
      }

      await client.query("COMMIT");
      logger.info("Store", `${updatedProducts.length} produtos atualizados com sucesso para a unidade ${dassOffice}`);

      return updatedProducts;
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Store", `Erro ao atualizar produtos: ${error}`);

      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError(
          "Erro ao atualizar produtos.",
          500,
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      }
    } finally {
      client.release();
    }
  }
};
