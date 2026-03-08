import { PrismaClient } from "@prisma/client";
import type { Form } from "@/core/entities";
import type { CreateFormData, IFormRepository } from "../form.repository.interface";
import type { UpdateFormInput } from "../form.schema";

function toFormEntity(row: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  version: number;
  slug: string | null;
  allowAnonymous: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Form {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status as Form["status"],
    version: row.version,
    slug: row.slug ?? undefined,
    allowAnonymous: row.allowAnonymous,
    createdBy: row.createdBy ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaFormRepository implements IFormRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateFormData): Promise<Form> {
    const row = await this.prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        status: "draft",
        version: 1,
        createdBy: data.createdBy || null,
        slug: data.slug || null,
        allowAnonymous: data.allowAnonymous ?? false,
      },
    });
    return toFormEntity(row);
  }

  async findById(id: string): Promise<Form | null> {
    const row = await this.prisma.form.findUnique({ where: { id } });
    return row ? toFormEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Form | null> {
    const row = await this.prisma.form.findUnique({ where: { slug } });
    return row ? toFormEntity(row) : null;
  }

  async findByCreatedBy(createdBy: string): Promise<Form[]> {
    const rows = await this.prisma.form.findMany({
      where: { createdBy },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toFormEntity);
  }

  async update(id: string, data: UpdateFormInput): Promise<Form | null> {
    const updateData: {
      title?: string;
      description?: string;
      status?: string;
      slug?: string | null;
      allowAnonymous?: boolean;
    } = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.allowAnonymous !== undefined) updateData.allowAnonymous = data.allowAnonymous;
    const row = await this.prisma.form.update({
      where: { id },
      data: updateData,
    });
    return toFormEntity(row);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.form.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async duplicate(id: string, createdBy: string): Promise<Form | null> {
    const existing = await this.prisma.form.findUnique({ where: { id } });
    if (!existing) return null;
    const row = await this.prisma.form.create({
      data: {
        title: `${existing.title} (cópia)`,
        description: existing.description,
        status: "draft",
        version: 1,
        createdBy: createdBy || null,
        slug: null,
        allowAnonymous: existing.allowAnonymous,
      },
    });
    return toFormEntity(row);
  }
}
