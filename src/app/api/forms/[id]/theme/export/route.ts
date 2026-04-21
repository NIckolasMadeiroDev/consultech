import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getFormRepository } from "@/infrastructure/database/repositories";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = context.params;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(id);
    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }
    const payload = {
      version: 1 as const,
      exportedAt: new Date().toISOString(),
      formId: form.id,
      theme: form.theme,
    };
    const body = JSON.stringify(payload, null, 2);
    const filename = `form-theme-${id.slice(0, 8)}.json`;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
