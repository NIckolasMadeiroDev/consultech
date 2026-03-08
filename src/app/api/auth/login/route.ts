import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/infrastructure/database/prisma";
import {
  createSession,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/auth-session";

const BCRYPT_PREFIX = /^\$2[ab]\$/;

function getCredentialsFromBody(body: unknown): { email: string; password: string } | null {
  const email = typeof (body as { email?: unknown }).email === "string"
    ? (body as { email: string }).email.trim()
    : "";
  const password = typeof (body as { password?: unknown }).password === "string"
    ? (body as { password: string }).password
    : "";
  if (!email || !password) return null;
  return { email, password };
}

async function validatePassword(
  admin: { id: string; passwordHash: string },
  password: string
): Promise<boolean> {
  const storedHash = admin.passwordHash;
  if (BCRYPT_PREFIX.test(storedHash)) {
    return compare(password, storedHash);
  }
  if (storedHash === password) {
    const hashed = await hash(password, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: hashed },
    });
    return true;
  }
  return false;
}

async function buildSuccessResponse(admin: { id: string; email: string; name: string }) {
  const token = await createSession({
    id: admin.id,
    email: admin.email,
    name: admin.name,
  });
  const res = NextResponse.json({
    user: { id: admin.id, email: admin.email, name: admin.name },
  });
  res.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
  return res;
}

function handleLoginError(e: unknown): NextResponse {
  const isDev = process.env.NODE_ENV === "development";
  const errMessage = e instanceof Error ? e.message : String(e);
  const errCode =
    e && typeof (e as { code?: string }).code === "string"
      ? (e as { code: string }).code
      : "";

  if (e instanceof Error && e.message.includes("AUTH_SECRET")) {
    return NextResponse.json(
      { error: "Configuração de autenticação ausente (AUTH_SECRET)" },
      { status: 500 }
    );
  }

  const isDbConnectionError =
    /authentication failed|credentials.*(not )?valid|can't reach database|database server|connection|P1001|P1002|P1008|P1017/i.test(
      errMessage
    ) || /P1001|P1002|P1008|P1017/.test(errCode);

  if (isDbConnectionError) {
    console.error("[auth/login] Erro de banco de dados:", e);
    return NextResponse.json(
      {
        error:
          "Não foi possível conectar ao banco de dados. Verifique se o servidor está acessível e se as credenciais em .env (DATABASE_URL) estão corretas.",
      },
      { status: 503 }
    );
  }

  console.error("[auth/login] Erro ao autenticar:", e);
  return NextResponse.json(
    {
      error:
        isDev && errMessage
          ? `Erro ao autenticar: ${errMessage}`
          : "Erro ao autenticar. Tente novamente ou contate o suporte.",
    },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const credentials = getCredentialsFromBody(body);
    if (!credentials) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email: credentials.email } });
    if (!admin) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const valid = await validatePassword(admin, credentials.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    return buildSuccessResponse(admin);
  } catch (e) {
    return handleLoginError(e);
  }
}
