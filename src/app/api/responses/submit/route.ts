import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { submitResponse } from "@/modules/responses/submit-response";
import { submitResponseSchema } from "@/modules/responses/response.schema";
import {
  getFormRepository,
  getQuestionRepository,
  getRespondentRepository,
  getResponseRepository,
} from "@/infrastructure/database/repositories";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json();
    const data = submitResponseSchema.parse(body);
    const formRepo = getFormRepository();
    const respondentRepo = getRespondentRepository();
    const responseRepo = getResponseRepository();
    const questionRepo = getQuestionRepository();
    return submitResponse(data, formRepo, respondentRepo, responseRepo, questionRepo);
  });
}
