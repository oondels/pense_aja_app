import { AppDataSource } from "../config/database";

const run = async () => {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
  console.log("Migrations executadas com sucesso.");
};

run().catch((error) => {
  console.error("Erro ao executar migrations:", error);
  process.exit(1);
});
