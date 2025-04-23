import { Router, Request, Response, NextFunction } from "express"
import { verifyToken } from "../middlewares/auth";
import roleVerificationAccess from "../middlewares/roleVerificationMiddleware";
import AIService from "../services/AIService"

const router = Router()

router.post("/improve-text", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { situationBefore, situationNow, projectName } = req.body

    // const params = { situationBefore, situationNow, projectName };

    // const hasInvalidParam = Object.entries(params).some(
    //   ([key, value]) => typeof value !== 'string' || value.trim() === ''
    // );

    // if (hasInvalidParam) {
    //   res.status(400).json({ message: "Parâmetros incorretos. Todos os campos devem ser strings e não podem estar vazios." });
    //   return;
    // }

    const result = await AIService.improveText(situationBefore, situationNow, projectName)

    res.status(200).json({ result })
  } catch (error) {
    next(error)
  }
})

export default router;