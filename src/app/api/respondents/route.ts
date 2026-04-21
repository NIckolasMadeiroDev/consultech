import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const search = url.searchParams.get("search");

    type WhereClause = {
      OR?: Array<{ name: { contains: string; mode: "insensitive" } } | { email: { contains: string; mode: "insensitive" } }>;
    };
    const where: WhereClause = {};
    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const respondents = await prisma.respondent.findMany({
      where,
      include: {
        responses: {
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return respondents.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      employeeId: r.employeeId,
      department: r.department,
      responseCount: r.responses.length,
      createdAt: r.createdAt.toISOString(),
    }));
  });
}
