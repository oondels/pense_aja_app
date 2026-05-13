import { NextFunction, Request, Response } from "express";
import { AuthorizationService } from "../services/authorization.service";
import { LedgerService } from "../services/ledger.service";
import { RbacAdminService } from "../services/rbac-admin.service";
import { UserPenseaja } from "../services/user-penseaja.service";
import {
  CreateRbacAssignmentInput,
  DassOffice,
  UpdateRbacAssignmentInput,
  UpdateUserProfileInput,
} from "../types/contracts";
import { isDassOffice } from "../utils/dassOffice";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UserPenseajaController = {
  async getUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration } = req.params;
      const { dassOffice } = req.query;

      if (registration.length < 7) {
        res
          .status(400)
          .json({ message: "Matricula inválida. O tamanho mínimo deve ser 7." });
        return;
      }

      const matricula = Number(registration);
      if (!matricula) {
        res
          .status(400)
          .json({ message: "Dados inválidos. Matrícula deve ser um número válido!" });
        return;
      }

      if (typeof dassOffice !== "string") {
        res
          .status(400)
          .json({ message: "Dados inválidos. Unidade Dass deve ser uma string!" });
        return;
      }

      if (!isDassOffice(dassOffice)) {
        res.status(400).json({ message: "Dados inválidos. Unidade Dass inválida!" });
        return;
      }

      const userData = await UserPenseaja.getUserData(matricula, dassOffice);
      res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  },

  async getUserPointsHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration } = req.params;
      const { dassOffice } = req.query;

      if (Number.isNaN(Number(registration))) {
        res.status(400).json({ message: "Matrícula inválida." });
        return;
      }

      if (typeof dassOffice !== "string" || !isDassOffice(dassOffice)) {
        res.status(400).json({ message: "Unidade Dass inválida." });
        return;
      }

      const history = await LedgerService.getUserLedgerHistory(
        Number(registration),
        dassOffice
      );
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  },

  async getUserOffice(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration } = req.params;
      const { userOffice, location } = await UserPenseaja.getUserOffice(registration);

      if (!userOffice) {
        res.status(400).json({ message: "Registro inválido. Matrícula desconhecida!" });
        return;
      }

      res
        .status(200)
        .json({ dassOffice: userOffice, message: `Matrícula validada, unidade: ${location ?? userOffice}` });
    } catch (error) {
      next(error);
    }
  },

  async updateUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration } = req.params;
      const { formData, dassOffice } = req.body as {
        formData: UpdateUserProfileInput;
        dassOffice: DassOffice;
      };

      if (registration.length < 7) {
        res
          .status(400)
          .json({ message: "Matricula inválida. O tamanho mínimo deve ser 7." });
        return;
      }

      const matricula = Number(registration);
      if (!matricula) {
        res
          .status(400)
          .json({ message: "Dados inválidos. Matrícula deve ser um número válido!" });
        return;
      }

      if (typeof formData?.email !== "string") {
        res.status(400).json({ message: "Email Inválido!" });
        return;
      }

      if (!emailRegex.test(formData.email)) {
        res.status(400).json({ message: "Email inválido!" });
        return;
      }

      if (!formData.email.includes("@grupodass.com.br")) {
        res.status(400).json({ message: "Insira um email do Grupo Dass!" });
        return;
      }

      const updatedUser = await UserPenseaja.updateUserData(matricula, dassOffice, formData);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },

  async getSessionContext(req: Request, res: Response, next: NextFunction) {
    try {
      const { dassOffice } = req.params;

      if (!req.user) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

      if (!isDassOffice(dassOffice)) {
        res.status(400).json({ message: "Unidade Dass inválida." });
        return;
      }

      const context = await AuthorizationService.resolveSessionContext(
        req.user,
        dassOffice,
        req.cookies.token
      );

      res.status(200).json({
        registration: context.registration,
        dassOffice: context.dassOffice,
        permissions: context.permissions,
        snapshotVersion: context.snapshotVersion,
        snapshotExpiresAt: context.snapshotExpiresAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  async listRbacRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await RbacAdminService.listRoles();
      res.status(200).json(roles);
    } catch (error) {
      next(error);
    }
  },

  async listRbacAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration, dassOffice, active } = req.query;
      const assignments = await RbacAdminService.listAssignments({
        registration:
          typeof registration === "string" ? registration : undefined,
        dassOffice: typeof dassOffice === "string" ? dassOffice : undefined,
        active: typeof active === "string" ? active : undefined,
      });

      res.status(200).json(assignments);
    } catch (error) {
      next(error);
    }
  },

  async getRbacAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assignment = await RbacAdminService.getAssignmentById(id);
      res.status(200).json(assignment);
    } catch (error) {
      next(error);
    }
  },

  async createRbacAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as CreateRbacAssignmentInput;
      const assignment = await RbacAdminService.createAssignment(payload);
      res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  },

  async updateRbacAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = req.body as UpdateRbacAssignmentInput;
      const assignment = await RbacAdminService.updateAssignment(id, payload);
      res.status(200).json(assignment);
    } catch (error) {
      next(error);
    }
  },

  async deleteRbacAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await RbacAdminService.deleteAssignment(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
