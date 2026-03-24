import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { FormPausedError } from "@/modules/responses/form-paused-error";

export async function apiHandler<T>(
  fn: () => Promise<T>
): Promise<Response> {
  try {
    const data = await fn();
    return Response.json(data, { status: 200 });
  } catch (error) {
    // Log no servidor para facilitar debug (erro aparece no terminal do Next.js)
    console.error("[apiHandler]", error);
    if (error instanceof ZodError) {
      const message = error.errors.map((e) => e.message).join("; ");
      return Response.json({ error: message }, { status: 400 });
    }
    // Tabela ou relação não existe no banco (ex.: após adicionar modelos sem rodar db push)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return Response.json(
        { error: "Schema do banco desatualizado. Execute: npx prisma db push" },
        { status: 503 }
      );
    }
    if (error instanceof FormPausedError) {
      return Response.json(
        {
          error: "Form is paused",
          pausedMessage: error.pausedMessage,
        },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Internal error";
    let status = 500;
    if (
      message === "Form not found" ||
      message === "Form does not accept responses" ||
      message === "Dashboard not found"
    ) {
      status = 404;
    } else if (message === "XAI_API_KEY not configured") {
      status = 503;
    } else if (message === "Já existe uma pasta com esse nome") {
      status = 409;
    }
    return Response.json({ error: message }, { status });
  }
}
