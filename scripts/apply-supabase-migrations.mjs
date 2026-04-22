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
  const trimmed = raw.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname;
    const user = decodeURIComponent((u.username || "").replace(/\+/g, " "));
    if (host.endsWith("pooler.supabase.com") && user.startsWith("postgres.")) {
      const ref = user.slice("postgres.".length);
      if (ref.length > 0) {
        u.hostname = `db.${ref}.supabase.co`;
        u.port = "5432";
        u.username = "postgres";
        u.searchParams.delete("pgbouncer");
        if (!u.searchParams.has("sslmode")) {
          u.searchParams.set("sslmode", "require");
        }
        return u.toString();
      }
    }
  } catch {
  }
  let direct = trimmed.replace(":6543/", ":5432/");
  direct = direct.replace(/\?pgbouncer=true(&|$)/, (_, end) =>
    end === "&" ? "?" : ""
  );
  direct = direct.replace(/\?$/, "");
  if (!/[?&]sslmode=/.test(direct)) {
    direct += direct.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  return direct;
}

function errorText(e) {
  const parts = [String(e?.message ?? e)];
  let c = e?.cause;
  let depth = 0;
  while (c && depth < 5) {
    parts.push(String(c?.message ?? c));
    c = c.cause;
    depth += 1;
  }
  if (e?.stderr) {
    parts.push(Buffer.isBuffer(e.stderr) ? e.stderr.toString() : String(e.stderr));
  }
  if (e?.stdout) {
    parts.push(Buffer.isBuffer(e.stdout) ? e.stdout.toString() : String(e.stdout));
  }
  return parts.join("\n");
}

function isDbUnreachableError(e) {
  const blob = errorText(e);
  if (e?.code === "P1001") return true;
  if (/P1001/i.test(blob)) return true;
  if (/Can't reach database server/i.test(blob)) return true;
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|EHOSTUNREACH/i.test(blob)) return true;
  if (/getaddrinfo|socket hang up|Connection refused/i.test(blob)) return true;
  return false;
}

const files = [
  "000_vector_extension.sql",
  "001_initial_schema.sql",
  "002_form_closing_message.sql",
  "003_form_folder_template.sql",
  "004_form_folder_entity.sql",
  "005_form_revision.sql",
  "006_form_paused_message.sql",
  "007_form_prisma_alignment.sql",
  "008_finance_contracts.sql",
  "009_finance_goals.sql",
  "010_finance_events.sql",
  "011_dashboard_charts.sql",
  "012_form_descriptions.sql",
  "013_content_blocks.sql",
  "014_form_themes.sql",
  "015_form_phase5_visuals.sql",
  "016_form_attachments.sql",
  "017_form_response_settings.sql",
  "018_form_section_visibility.sql",
];

async function main() {
  if (process.env.SKIP_DB_MIGRATIONS === "1") {
    process.stdout.write("SKIP_DB_MIGRATIONS=1, migracoes ignoradas.\n");
    return;
  }
  let direct;
  try {
    direct = toDirectUrl(loadRawDatabaseUrl());
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stdout.write(`Migracoes omitidas (sem DATABASE_URL): ${msg}\n`);
    return;
  }
  process.env.DATABASE_URL = direct;
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
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
    } catch (inner) {
      if (isDbUnreachableError(inner)) {
        process.stderr.write(
          `${errorText(inner)}\nMigracoes omitidas: banco inacessivel neste momento (o build continua). ` +
            `Com o Postgres online, rode: npm run db:apply-supabase-migrations\n`
        );
        return;
      }
      throw inner;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  if (isDbUnreachableError(e)) {
    process.stderr.write(
      `${errorText(e)}\nMigracoes omitidas: banco inacessivel (o build continua). ` +
        `Com o Postgres online, rode: npm run db:apply-supabase-migrations\n`
    );
    process.exit(0);
  }
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
