import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import penseAjaRoutes from "./src/routes/pense-aja";
import UserPenseajaRoute from "./src/routes/user-penseaja";
import dotenv from "./src/config/dotenv";
import { CustomError } from "./src/types/CustomError";

const app = express();
const port = 2512;

app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(express.json());
app.use("/pense-aja/", penseAjaRoutes);
app.use("/user/", UserPenseajaRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Pense Aja API");
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  
  const statusCode = error instanceof CustomError ? error.statusCode : 500;
  console.log("Status code: ", statusCode);
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
