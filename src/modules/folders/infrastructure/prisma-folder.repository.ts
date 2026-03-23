import { Prisma, PrismaClient } from "@prisma/client";
import type { FormFolderRecord, IFolderRepository } from "../folder.repository.interface";

function toRecord(row: {
  id: string;
  name: string;
  createdBy: string | null;
  createdAt: Date;
}): FormFolderRecord {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
  };
}

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCreatedBy(createdBy: string): Promise<FormFolderRecord[]> {
    const rows = await this.prisma.formFolder.findMany({
      where: { createdBy },
      orderBy: { name: "asc" },
    });
    return rows.map(toRecord);
  }

  async create(data: { name: string; createdBy: string }): Promise<FormFolderRecord> {
    try {
      const row = await this.prisma.formFolder.create({
        data: {
          name: data.name,
          createdBy: data.createdBy,
        },
      });
      return toRecord(row);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new Error("Já existe uma pasta com esse nome");
      }
      throw e;
    }
  }
}
