export interface NotificationPayload {
  to: string;
  subject: string;
  title: string;
  message: string;
  link?: string;
  scheduleFor?: number;
  application?: string
}