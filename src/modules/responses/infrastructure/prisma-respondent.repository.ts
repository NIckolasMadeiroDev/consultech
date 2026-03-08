import { PrismaClient } from "@prisma/client";
import type { Respondent } from "@/core/entities";
import type { CreateRespondentInput, IRespondentRepository } from "../respondent.repository.interface";

function toRespondentEntity(row: {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  department: string | null;
  createdAt: Date;
}): Respondent {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    employeeId: row.employeeId ?? undefined,
    department: row.department ?? undefined,
    createdAt: row.createdAt,
  };
}

export class PrismaRespondentRepository implements IRespondentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRespondentInput): Promise<Respondent> {
    const row = await this.prisma.respondent.create({
      data: {
        name: data.name,
        email: data.email,
        employeeId: data.employeeId,
        department: data.department,
      },
    });
    return toRespondentEntity(row);
  }

  async findById(id: string): Promise<Respondent | null> {
    const row = await this.prisma.respondent.findUnique({ where: { id } });
    return row ? toRespondentEntity(row) : null;
  }

  async findByEmail(email: string): Promise<Respondent | null> {
    const row = await this.prisma.respondent.findFirst({
      where: { email },
    });
    return row ? toRespondentEntity(row) : null;
  }
}
