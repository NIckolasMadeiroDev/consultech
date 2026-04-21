import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = context.params;
  return NextResponse.json(
    {
      formId: id,
      message:
        "A imagem PNG é gerada no browser a partir da pré-visualização (botão «Exportar imagem» no editor de tema).",
      themeEditorPath: `/admin/forms/${id}/theme`,
    },
    { status: 200 }
  );
}
