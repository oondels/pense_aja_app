import axios from "axios"
import dotenv from "../config/dotenv"
import { NotificationPayload } from "../types/Notification"

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
}