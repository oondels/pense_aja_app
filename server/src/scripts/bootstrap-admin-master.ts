import { initializeDatabase } from "../config/database";
import RbacRoleEntity from "../models/RbacRole";
import RbacUserUnitRoleEntity from "../models/RbacUserUnitRole";
import UsuarioEntity from "../models/Usuario";
import { assertDassOffice } from "../utils/dassOffice";

const [registration, officeArg] = process.argv.slice(2);

if (!registration || !officeArg) {
  console.error(
    "Uso: npm run bootstrap:admin-master -- <matricula> <dassOffice>"
  );
  process.exit(1);
}

const run = async () => {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const dassOffice = assertDassOffice(officeArg);

    const user = await queryRunner.manager.getRepository(UsuarioEntity).findOne({
      where: {
        matricula: String(registration),
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado em autenticacao.usuarios.");
    }

    const role = await queryRunner.manager.getRepository(RbacRoleEntity).findOne({
      where: {
        code: "admin_master",
      },
    });

    if (!role) {
      throw new Error("Role admin_master não encontrada.");
    }

    const existing = await queryRunner.manager
      .getRepository(RbacUserUnitRoleEntity)
      .findOne({
        where: {
          matricula: String(registration),
          unidade_dass: dassOffice,
          role_id: String(role.id),
        },
      });

    if (!existing) {
      await queryRunner.manager.getRepository(RbacUserUnitRoleEntity).save({
        matricula: String(registration),
        unidade_dass: dassOffice,
        role_id: String(role.id),
        active: true,
        active_from: new Date(),
        active_until: null,
        createdat: new Date(),
        updatedat: new Date(),
      });
    }

    await queryRunner.commitTransaction();
    console.log(
      `admin_master garantido para matrícula ${registration} na unidade ${dassOffice}.`
    );
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro ao bootstrapar admin_master:", error);
    process.exit(1);
  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
};

run().catch((error) => {
  console.error("Erro ao iniciar bootstrap de admin_master:", error);
  process.exit(1);
});
