import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;

    const respondent = await prisma.respondent.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            form: {
              select: { id: true, title: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!respondent) {
      throw new Error("Membro não encontrado");
    }

    return {
      id: respondent.id,
      name: respondent.name,
      email: respondent.email,
      employeeId: respondent.employeeId,
      department: respondent.department,
      responseCount: respondent.responses.length,
      createdAt: respondent.createdAt.toISOString(),
      responses: respondent.responses.map((r) => ({
        id: r.id,
        form: {
          id: r.form.id,
          title: r.form.title,
        },
        submittedAt: r.submittedAt.toISOString(),
      })),
    };
  });
}
