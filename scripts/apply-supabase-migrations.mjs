import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

function loadRawDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error("DATABASE_URL nao definida e .env ausente");
  }
  const envText = readFileSync(envPath, "utf8");
  const line = envText.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
  if (!line) {
    throw new Error("DATABASE_URL ausente no .env");
  }
  let raw = line.slice("DATABASE_URL=".length).trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1);
  }
  return raw;
}

function toDirectUrl(raw) {
  let direct = raw.replace(":6543/", ":5432/");
  direct = direct.replace(/\?pgbouncer=true(&|$)/, (_, end) =>
    end === "&" ? "?" : ""
  );
  direct = direct.replace(/\?$/, "");
  if (!/[?&]sslmode=/.test(direct)) {
    direct += direct.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  return direct;
}

const files = [
  "001_initial_schema.sql",
  "002_form_closing_message.sql",
  "003_form_folder_template.sql",
  "004_form_folder_entity.sql",
  "005_form_revision.sql",
  "006_form_paused_message.sql",
];

async function main() {
  if (process.env.SKIP_DB_MIGRATIONS === "1") {
    process.stdout.write("SKIP_DB_MIGRATIONS=1, migracoes ignoradas.\n");
    return;
  }
  const direct = toDirectUrl(loadRawDatabaseUrl());
  process.env.DATABASE_URL = direct;
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS _app_sql_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    const rows = await prisma.$queryRaw`
      SELECT filename FROM _app_sql_migrations
    `;
    const applied = new Set(rows.map((r) => r.filename));
    const env = { ...process.env, DATABASE_URL: direct };
    for (const f of files) {
      if (applied.has(f)) {
        process.stdout.write(`Pulando ${f} (ja aplicada)\n`);
        continue;
      }
      const filePath = join("supabase", "migrations", f);
      process.stdout.write(`Aplicando ${f}\n`);
      execSync(
        `npx prisma db execute --file "${filePath}" --schema prisma/schema.prisma`,
        { env, stdio: "inherit", cwd: process.cwd(), shell: true }
      );
      await prisma.$executeRaw`
        INSERT INTO _app_sql_migrations (filename) VALUES (${f})
      `;
    }
    process.stdout.write("Migracoes verificadas/aplicadas.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
