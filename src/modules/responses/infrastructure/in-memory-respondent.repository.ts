import { randomUUID } from "node:crypto";
import type { Respondent } from "@/core/entities";
import type { CreateRespondentInput, IRespondentRepository } from "../respondent.repository.interface";

const store: Map<string, Respondent> = new Map();

export class InMemoryRespondentRepository implements IRespondentRepository {
  async create(data: CreateRespondentInput): Promise<Respondent> {
    const respondent: Respondent = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      employeeId: data.employeeId,
      department: data.department,
      createdAt: new Date(),
    };
    store.set(respondent.id, respondent);
    return respondent;
  }

  async findById(id: string): Promise<Respondent | null> {
    return store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Respondent | null> {
    return Array.from(store.values()).find((r) => r.email === email) ?? null;
  }
}

export function clearRespondentStore(): void {
  store.clear();
}
