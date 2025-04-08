import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import penseAjaRoutes from "./src/routes/pense-aja";
import UserPenseajaRoute from "./src/routes/user-penseaja"
import dotenv from "./src/config/dotenv"

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

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Erro no método ${req.method} em ${req.originalUrl} - ${error}  `);
  res.status(500).json({ message: "Erro interno no servidor. Contate a equipe de automação!" });
});

app.listen(port, () => {
  console.log(`Pense Aja API is running at port: ${port} on ${dotenv.DEV_ENV} mode!`);
});
