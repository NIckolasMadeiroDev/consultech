import type { Respondent } from "@/core/entities";

export interface CreateRespondentInput {
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
}

export interface IRespondentRepository {
  create(data: CreateRespondentInput): Promise<Respondent>;
  findById(id: string): Promise<Respondent | null>;
  findByEmail(email: string): Promise<Respondent | null>;
}
