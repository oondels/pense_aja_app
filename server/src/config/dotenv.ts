import path from "path";
import dotenv from "dotenv";
const envFile = process.env.DEV_ENV ? ".env" : ".env.production";
dotenv.config({ path: path.resolve(__dirname, "../../", envFile) });

const vars = {
  IP: process.env.IP,
  PORT: process.env.PORT,
  PASS: process.env.PASS,
  USERS: process.env.USERS,
  DBASE: process.env.DBASE,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  DEV_ENV: process.env.DEV_ENV,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  NOTIFICATION_API: process.env.NOTIFICATION_API || "",
  NOTIFICATION_API_KEY: process.env.NOTIFICATION_API_KEY || "",
  REDIS_HOST: process.env.REDIS_HOST || "",
  REDIS_PASS: process.env.REDIS_PASS || "",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "",
};

if (!vars.JWT_SECRET) {
  throw new Error("JWT_SECRET não configurado.");
}

if (!vars.REDIS_HOST) {
  console.warn("[CONFIG] REDIS_HOST não configurado: blacklist de token JWT desativada.");
}
if (!vars.NOTIFICATION_API) {
  console.warn("[CONFIG] NOTIFICATION_API não configurada: notificações por push desativadas.");
}
if (!vars.GEMINI_API_KEY) {
  console.warn("[CONFIG] GEMINI_API_KEY não configurada: melhoria de texto por IA desativada.");
}

export default vars;
