import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    if (!q || q.length === 0) {
      return { forms: [], respondents: [], answerMatches: [] };
    }
    const pattern = `%${q}%`;
    const [forms, respondents, answerRows] = await Promise.all([
      prisma.form.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        take: 20,
        select: { id: true, title: true, status: true, createdAt: true },
      }),
      prisma.respondent.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 20,
        select: { id: true, name: true, email: true },
      }),
      prisma.$queryRaw<
        Array<{
          id: string;
          response_id: string;
          form_id: string;
          form_title: string;
          respondent_name: string;
          value: unknown;
        }>
      >`
        SELECT a.id, a.response_id, r.form_id, f.title AS form_title,
               resp.name AS respondent_name, a.value
        FROM answer a
        JOIN response r ON r.id = a.response_id
        JOIN form f ON f.id = r.form_id
        JOIN respondent resp ON resp.id = r.respondent_id
        WHERE a.value::text ILIKE ${pattern}
        LIMIT 30
      `,
    ]);
    const answerMatches = answerRows.map((row) => ({
      answerId: row.id,
      responseId: row.response_id,
      formId: row.form_id,
      formTitle: row.form_title,
      respondentName: row.respondent_name,
      snippet: String(row.value).slice(0, 120),
    }));
    return {
      forms: forms.map((f) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        createdAt: f.createdAt,
      })),
      respondents: respondents.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
      })),
      answerMatches,
    };
  });
}
