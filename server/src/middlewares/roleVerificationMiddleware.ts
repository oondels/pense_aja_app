import { Request, Response, NextFunction } from "express";

const roleVerificationAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allowedRoles: Array<string> = ["analista", "gerente", "automacao"];
    const userRole = req.user?.funcao || "none";

    const access = allowedRoles.some((role) =>
      userRole.toLowerCase().includes(role)
    );

    if (!access) {
      res
        .status(403)
        .json({
          message: "Acesso proibido: Função do colaborador não permitida!",
        });
      return;
    }

    next();
  } catch (error) {
    res
      .status(404)
      .json({
        message:
          "Erro ao verificar função do colaborador. Entre em contato com a equipe de suporte!",
      });
  }
};

export default roleVerificationAccess;
