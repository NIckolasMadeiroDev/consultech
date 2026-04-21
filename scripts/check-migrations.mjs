import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const migrations = await prisma.$queryRaw`
      SELECT filename FROM _app_sql_migrations ORDER BY filename
    `;
    console.log("Migrations aplicadas:", migrations);
  } catch (error) {
    console.error("Erro:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
