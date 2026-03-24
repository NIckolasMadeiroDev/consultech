import { randomUUID } from "node:crypto";
import type { Response, Answer } from "@/core/entities";
import type { ResponseFilters } from "@/types";
import type { SubmitResponseInput, IResponseRepository } from "../response.repository.interface";

const responseStore: Map<string, Response> = new Map();
const answerStore: Map<string, Answer> = new Map();

export class InMemoryResponseRepository implements IResponseRepository {
  async create(data: SubmitResponseInput): Promise<Response> {
    const response: Response = {
      id: randomUUID(),
      formId: data.formId,
      respondentId: data.respondentId,
      submittedAt: new Date(),
    };
    responseStore.set(response.id, response);
    for (const a of data.answers) {
      const answer: Answer = {
        id: randomUUID(),
        responseId: response.id,
        questionId: a.questionId,
        value: a.value,
      };
      answerStore.set(answer.id, answer);
    }
    return response;
  }

  async findById(id: string): Promise<Response | null> {
    return responseStore.get(id) ?? null;
  }

  async findByFormId(formId: string, filters?: ResponseFilters): Promise<Response[]> {
    let list = Array.from(responseStore.values()).filter((r) => r.formId === formId);
    if (filters?.respondentId) {
      list = list.filter((r) => r.respondentId === filters.respondentId);
    }
    if (filters?.startDate) {
      list = list.filter((r) => r.submittedAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((r) => r.submittedAt <= filters.endDate!);
    }
    if (filters?.answerValue?.trim()) {
      const term = filters.answerValue.trim().toLowerCase();
      list = list.filter((r) => {
        const ans = Array.from(answerStore.values()).filter((a) => a.responseId === r.id);
        return ans.some((a) => JSON.stringify(a.value).toLowerCase().includes(term));
      });
    }
    return list.sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  }

  async findPageByFormId(
    formId: string,
    opts: { filters?: ResponseFilters; page: number; limit: number }
  ): Promise<{ data: Response[]; total: number }> {
    const list = await this.findByFormId(formId, opts.filters);
    const total = list.length;
    const start = Math.max(0, (opts.page - 1) * opts.limit);
    const limit = Math.min(100, Math.max(1, opts.limit));
    const data = list.slice(start, start + limit);
    return { data, total };
  }

  async getAnswersByResponseId(responseId: string): Promise<Answer[]> {
    return Array.from(answerStore.values()).filter(
      (a) => a.responseId === responseId
    );
  }

  async getSummaryByFormId(
    formId: string,
    filters?: ResponseFilters
  ): Promise<{ count: number; lastSubmittedAt: Date | null }> {
    let list = Array.from(responseStore.values()).filter((r) => r.formId === formId);
    if (filters?.startDate) {
      list = list.filter((r) => r.submittedAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((r) => r.submittedAt <= filters.endDate!);
    }
    if (filters?.answerValue?.trim()) {
      const term = filters.answerValue.trim().toLowerCase();
      list = list.filter((r) => {
        const ans = Array.from(answerStore.values()).filter((a) => a.responseId === r.id);
        return ans.some((a) => JSON.stringify(a.value).toLowerCase().includes(term));
      });
    }
    const sorted = [...list].sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
    return {
      count: list.length,
      lastSubmittedAt: sorted[0]?.submittedAt ?? null,
    };
  }

  async delete(id: string): Promise<boolean> {
    for (const [aid, a] of answerStore.entries()) {
      if (a.responseId === id) answerStore.delete(aid);
    }
    return responseStore.delete(id);
  }
}

export function clearResponseStore(): void {
  responseStore.clear();
  answerStore.clear();
}
