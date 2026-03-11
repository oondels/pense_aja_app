import { NextFunction, Request, Response } from "express";
import { UserPenseaja } from "../services/user-penseaja.service";
import { DassOffice, UpdateUserProfileInput } from "../types/contracts";

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

      const userData = await UserPenseaja.getUserData(matricula, dassOffice);
      res.status(200).json(userData);
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
};
