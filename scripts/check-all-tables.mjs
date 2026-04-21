import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log("Todas as tabelas:", result);
  } catch (error) {
    console.error("Erro:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
