import { AppDataSource } from "../config/database";

const run = async () => {
  await AppDataSource.initialize();
  await AppDataSource.undoLastMigration();
  await AppDataSource.destroy();
  console.log("Última migration revertida com sucesso.");
};

run().catch((error) => {
  console.error("Erro ao reverter migration:", error);
  process.exit(1);
});
