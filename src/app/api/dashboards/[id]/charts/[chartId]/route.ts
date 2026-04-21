import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chartId: string }> }
) {
  return apiHandler(async () => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const { chartId } = await params;

    const existing = await prisma.dashboardChart.findUnique({
      where: { id: chartId },
    });

    if (!existing) {
      throw new Error("Gráfico não encontrado");
    }

    await prisma.dashboardChart.delete({
      where: { id: chartId },
    });

    return { success: true, message: "Gráfico deletado com sucesso" };
  });
}
