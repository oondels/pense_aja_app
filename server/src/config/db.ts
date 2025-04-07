import { Pool } from "pg";
import dotenv from "./dotenv";

const pool = new Pool({
  user: dotenv.USERS,
  password: dotenv.PASS,
  host: dotenv.IP,
  port: Number(dotenv.PORT),
  database: dotenv.DBASE,
});

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err: any) => {
    console.error("Connection error", err.stack);
  });

export default pool;
