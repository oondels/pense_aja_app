import { Router, Request, Response, NextFunction } from "express";
import { PenseAjaService } from "../services/penseAjaService";
import { verifyToken } from "../middlewares/auth";
import roleVerificationAccess from "../middlewares/roleVerificationMiddleware";
import { NotificationService } from "../services/NotificationService";
import { UserPenseaja } from "../services/UserPenseaja";

const ip = process.env.DEV_ENV === 'development' ? 'http://localhost:5173' : 'http://10.100.1.43:5050'

const router = Router();

const formatUserName = (name: string) => {
  const splitedName = name.split(" ")
  return splitedName[0] + " " + splitedName[splitedName.length - 1]
}

router.get("/:dassOffice", async (req: Request, res: Response) => {
  try {
    const { dassOffice } = req.params;
    const { startDate, endDate, name, sector, manager, project, turno, status } = req.query;

    if (!dassOffice) {
      res.status(400).json({
        erro: true,
        mensagem: "O campo 'dassOffice' é obrigatório.",
        dados: "Não há registros!",
      });

      return
    }

    if (startDate && isNaN(Date.parse(startDate as string))) {
      res.status(400).json({
        erro: true,
        mensagem: "Insira uma data válida.",
        dados: "Não há registros!",
      });
      return
    }

    if (endDate && isNaN(Date.parse(endDate as string))) {
      res.status(400).json({
        erro: true,
        mensagem: "Insira uma data válida.",
        dados: "Não há registros!",
      });
      return
    }

    const startDateParsed = new Date(startDate as string)
    const endDateParsed = new Date(endDate as string)

    const result = await PenseAjaService.fetchPenseAja(dassOffice, startDateParsed, endDateParsed, name as string, sector as string, manager as string, project as string, turno as string, status as string);

    res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido!";
    res.status(500).json({
      erro: true,
      mensagem: "Erro ao consultar dados do Pense Aja: " + errorMessage,
      dados: "Não há registros!",
    });
  }
});

router.post("/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;
    const penseajaData = req.body;

    const { pense_aja, userManager } = await PenseAjaService.createPenseAja(penseajaData, dassOffice);

    // Verifica se encontra gerente do usuário e se o gerente esta com notificações ativas
    if (userManager) {
      // const notificationEnabled = await NotificationService.isNotificationEnabled(userManager.matricula, dassOffice);
      const notificationEnabled = await NotificationService.isNotificationEnabled(3020495, dassOffice);

      if (notificationEnabled) {
        await NotificationService.sendNotification({
          to: "hendrius.santana@grupodass.com.br",
          subject: "Aplicativo Pense Aja",
          title: "Novo Pense Aja Cadastrado.",
          message: `Um novo registro de Pense Aja foi cadastrado pelo usuário ${formatUserName(pense_aja.nome)}. Projeto: ${pense_aja.nome_projeto}.`,
          application: "Pense e Aja",
          link: `${ip}/pense-aja/${pense_aja.id}`
        });
      }
    }

    const message = userManager ? "Pense aja cadastrado com sucesso!" : "Pense aja cadastrado com sucesso! Solicite seu gerente para ativar as notificações para vizualizar mais rápido."

    res.status(201).json({
      message: message,
    });
  } catch (error) {
    next(error);
  }
}
);

router.get("/:dassOffice/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, dassOffice } = req.params;

    const result = await PenseAjaService.getPenseAjaById(id, dassOffice);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
);

router.put("/avaliar/:id", verifyToken, roleVerificationAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { id } = req.params;

    const evaluationData = {
      ...req.user,
      ...data,
    };

    const newEvaluation = await PenseAjaService.evaluatePenseAja(
      id,
      evaluationData
    );

    const userEmail = await UserPenseaja.getUserEmail(evaluationData.matricula, data.dassOffice)

    let avaliadorNome
    if (newEvaluation.analista_avaliador) {
      avaliadorNome = newEvaluation.analista_avaliador
        .split(".")
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
    }

    const notificationEnabled = await NotificationService.isNotificationEnabled(evaluationData.matricula, data.dassOffice);
    if (userEmail && notificationEnabled) {
      await NotificationService.sendNotification({
        to: userEmail.email,
        subject: "Aplicativo Pense Aja",
        title: "Pense Aja Avaliado.",
        message: `Seu registro de Pense Aja foi avaliado${avaliadorNome ? " pelo usuário " + avaliadorNome : "!"}. 
        Abra o aplicativo e veja sua pontuação e feedbacks!`,
        application: "Pense e Aja",
        link: `${ip}/pense-aja/${id}`
      });
    }

    res.status(200).json({
      message: "Pense Aja avaliado com sucesso!",
      data: newEvaluation,
    });
    return;
  } catch (error) {
    next(error);
  }
}
);

router.put("/purchase/:registration", verifyToken, roleVerificationAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registration } = req.params;
    const { product, colaboradorData, analista, dassOffice } = req.body;

    if (Number.isNaN(Number(registration))) {
      res.status(400).json({ message: "Matrícula Inválida." });
      return
    }

    const user = await UserPenseaja.getUserData(Number(registration), dassOffice);
    if (!user) {
      res.status(400).json({ message: "Erro ao resgatar produto! Usuário não encontrado." });
      return
    }
    const userPoints = { pontos: user.pontos, pontos_resgatados: user.pontos_resgatados }
    const result = await PenseAjaService.buyProduct(dassOffice, product, colaboradorData, analista, userPoints);

    res.status(200).json({
      message: "Produto Resgatado com sucesso!",
      data: result,
    });
  } catch (error) {
    next(error)
  }
})

export default router;
