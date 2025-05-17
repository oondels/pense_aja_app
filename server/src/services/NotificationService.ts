import axios from "axios"
import dotenv from "../config/dotenv"
import { NotificationPayload } from "../types/Notification"
import pool from "../config/db"
import { CustomError } from "../types/CustomError"

export const NotificationService = {
  async sendNotification(payload: NotificationPayload) {
    try {
      await axios.post(`${dotenv.NOTIFICATION_API}/notification/`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": dotenv.NOTIFICATION_API_KEY,
        }
      })
    } catch (error: any) {
      console.error("Error sending notification:", error);
      return
    }

  },

  async isNotificationEnabled(registration: string | number, dassOffice: string) {
    const client = await pool.connect()
    try {
      const query = `
        SELECT 
          authorized_notifications_apps AS notification_enabled
        FROM 
          autenticacao.emails
        WHERE 
          matricula = $1 AND authorized_notifications_apps @> '["pense_aja"]'::jsonb AND unidade_dass = $2
      `;

      const result = await client.query(query, [registration, dassOffice]);
      return result.rows[0]?.notification_enabled || false;

    } catch (error) {
      const errorMessage = error instanceof CustomError ? error.message : "Erro Interno no servidor!";
      console.error("Error checking notification enabled:", errorMessage);
      throw error;
    } finally {
      client.release();
    }
  }
}