import { NextFunction, Request, Response } from "express";
import { AuthorizationService } from "../services/authorization.service";

type DassOfficeResolver = (req: Request) => string | undefined;
type RegistrationResolver = (req: Request) => string | undefined;

export const requirePermission =
  (permission: string, resolveDassOffice: DassOfficeResolver) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

      const dassOffice = resolveDassOffice(req);
      if (!dassOffice) {
        res.status(400).json({ message: "Unidade Dass obrigatória." });
        return;
      }

      const context = await AuthorizationService.resolveSessionContext(
        req.user,
        dassOffice
      );

      AuthorizationService.assertPermission(context, permission);
      req.authContext = context;
      next();
    } catch (error) {
      next(error);
    }
  };

export const requireAnyPermission =
  (permissions: string[], resolveDassOffice: DassOfficeResolver) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

      const dassOffice = resolveDassOffice(req);
      if (!dassOffice) {
        res.status(400).json({ message: "Unidade Dass obrigatória." });
        return;
      }

      const context = await AuthorizationService.resolveSessionContext(
        req.user,
        dassOffice
      );

      AuthorizationService.assertAnyPermission(context, permissions);
      req.authContext = context;
      next();
    } catch (error) {
      next(error);
    }
  };

export const requireSelfOrPermission =
  (
    permission: string,
    resolveDassOffice: DassOfficeResolver,
    resolveRegistration: RegistrationResolver
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

      const requestedRegistration = resolveRegistration(req);
      if (!requestedRegistration) {
        res.status(400).json({ message: "Matrícula obrigatória." });
        return;
      }

      if (String(req.user.matricula) === String(requestedRegistration)) {
        next();
        return;
      }

      const dassOffice = resolveDassOffice(req);
      if (!dassOffice) {
        res.status(400).json({ message: "Unidade Dass obrigatória." });
        return;
      }

      const context = await AuthorizationService.resolveSessionContext(
        req.user,
        dassOffice
      );

      AuthorizationService.assertPermission(context, permission);
      req.authContext = context;
      next();
    } catch (error) {
      next(error);
    }
  };
