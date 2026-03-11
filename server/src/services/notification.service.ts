import axios from "axios";
import dotenv from "../config/dotenv";
import { initializeDatabase } from "../config/database";
import EmailEntity from "../models/Email";
import { NotificationPayload } from "../types/Notification";
import { CustomError } from "../types/CustomError";
import { DassOffice } from "../types/contracts";

export const NotificationService = {
  async sendNotification(payload: NotificationPayload) {
    try {
      await axios.post(`${dotenv.NOTIFICATION_API}/notification/`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": dotenv.NOTIFICATION_API_KEY,
        },
      });
    } catch (error: unknown) {
      console.error("Error sending notification:", error);
      return;
    }
  },

  async isNotificationEnabled(
    registration: string | number,
    dassOffice: DassOffice
  ): Promise<boolean> {
    try {
      const dataSource = await initializeDatabase();
      const result = await dataSource
        .getRepository(EmailEntity)
        .createQueryBuilder("email")
        .select("email.authorized_notifications_apps", "notification_enabled")
        .where("email.matricula = :registration", {
          registration: String(registration),
        })
        .andWhere("email.unidade_dass = :dassOffice", { dassOffice })
        .andWhere(`email.authorized_notifications_apps @> '["pense_aja"]'::jsonb`)
        .getRawOne<{ notification_enabled?: unknown }>();

      return Boolean(result?.notification_enabled);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : "Erro Interno no servidor!";
      console.error("Error checking notification enabled:", errorMessage);
      throw error;
    }
  },
};
