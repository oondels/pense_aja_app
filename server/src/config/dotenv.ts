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
  JWT_SECRET: process.env.JWT_SECRET || 'default_value',
  DEV_ENV: process.env.DEV_ENV,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  NOTIFICATION_API: process.env.NOTIFICATION_API || "",
  NOTIFICATION_API_KEY: process.env.NOTIFICATION_API_KEY || "",
  REDIS_HOST: process.env.REDIS_HOST || "",
  REDIS_PASS: process.env.REDIS_PASS || "",
};

export default vars;
