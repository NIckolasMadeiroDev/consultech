import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the SQL file
    const sql = readFileSync(
      join(process.cwd(), "supabase", "migrations", "011_dashboard_charts.sql"),
      "utf8"
    );

    // Remove comments and split by semicolon
    const lines = sql.split("\n");
    let cleanSql = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("--")) {
        cleanSql += line + "\n";
      }
    }

    const statements = cleanSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toUpperCase().startsWith("COMMENT"));

    for (const statement of statements) {
      if (statement) {
        console.log("Executando:", statement.substring(0, 60) + "...");
        await prisma.$executeRawUnsafe(statement);
      }
    }

    // Mark as applied
    await prisma.$executeRaw`
      INSERT INTO _app_sql_migrations (filename) VALUES ('011_dashboard_charts.sql')
      ON CONFLICT (filename) DO NOTHING
    `;

    console.log("Migration 011_dashboard_charts.sql aplicada com sucesso!");
  } catch (error) {
    console.error("Erro ao aplicar migration:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
