import { Pool } from "pg";
import dotenv from "./dotenv";

const pool = new Pool({
  user: dotenv.USERS,
  password: dotenv.PASS,
  host: dotenv.IP,
  port: Number(dotenv.PORT),
  database: dotenv.DBASE,
});

let development = false;
const connectDatabase = async () => {
  development = dotenv.DEV_ENV === "development";

  let client = null;
  try {
    client = await pool.connect();

    if (development) console.log(`Conected to database on ${dotenv.IP}`);
  } catch (error) {
    console.error("Error connecting on database: ", error);
  } finally {
    if (client) {
      client.release();

      if (development) console.log("Client released");
    }
  }
};
connectDatabase();

export default pool;
