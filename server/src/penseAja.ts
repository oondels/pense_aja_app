import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "./config/dotenv";
import { CustomError } from "./types/CustomError";
import PenseAjaRoutes from "./routes/penseAja.route";
import UserPenseajaRoute from "./routes/userPensAaja.route";
import AiTools from "./routes/aiTools.route"

const app = express();
const port = 2512;

app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000", "http://localhost:5050"], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/pense-aja/", PenseAjaRoutes);
app.use("/user/", UserPenseajaRoute);
app.use("/ai/", AiTools)

app.get("/", (req: Request, res: Response) => {
  res.send("Pense Aja API");
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {

  const statusCode = error instanceof CustomError ? error.statusCode : 500;
  const message = error.message || "Erro interno no servidor.";
  const details = error.details || null;

  console.error(
    `Erro no método ${req.method} em ${req.originalUrl} - ${message}  `
  );
  if (details) {
    console.error("Detalhes do erro: ", details);
  }

  res.status(statusCode).json({
    message: message + " Contate a equipe de automação!",
    ...(process.env.DEV_ENV === "development" && details && { details }),
  });
  return;
});

app.listen(port, () => {
  console.log(
    `Pense Aja API is running at port: ${port} on ${dotenv.DEV_ENV} mode!`
  );
});
