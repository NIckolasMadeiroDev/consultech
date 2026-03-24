import { PrismaClient } from "@prisma/client";
import type { Form } from "@/core/entities";
import type { CreateFormData, IFormRepository } from "../form.repository.interface";
import type { UpdateFormInput } from "../form.schema";

function toFormEntity(row: {
  id: string;
  title: string;
  description: string | null;
  closingMessage: string | null;
  pausedMessage: string | null;
  folderId: string | null;
  folderRef: { name: string } | null;
  isTemplate: boolean;
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
    closingMessage: row.closingMessage ?? undefined,
    pausedMessage: row.pausedMessage ?? undefined,
    folderId: row.folderId ?? undefined,
    folder: row.folderRef?.name ?? undefined,
    isTemplate: row.isTemplate,
    status: row.status as Form["status"],
    version: row.version,
    slug: row.slug ?? undefined,
    allowAnonymous: row.allowAnonymous,
    createdBy: row.createdBy ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const folderInclude = { folderRef: { select: { name: true } } } as const;

export class PrismaFormRepository implements IFormRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateFormData): Promise<Form> {
    const row = await this.prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        closingMessage: data.closingMessage ?? null,
        pausedMessage: data.pausedMessage ?? null,
        folderId: data.folderId ?? null,
        isTemplate: data.isTemplate ?? false,
        status: data.status ?? "draft",
        version: 1,
        createdBy: data.createdBy || null,
        slug: data.slug || null,
        allowAnonymous: data.allowAnonymous ?? false,
      },
      include: folderInclude,
    });
    return toFormEntity(row);
  }

  async findById(id: string): Promise<Form | null> {
    const row = await this.prisma.form.findUnique({
      where: { id },
      include: folderInclude,
    });
    return row ? toFormEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Form | null> {
    const row = await this.prisma.form.findUnique({
      where: { slug },
      include: folderInclude,
    });
    return row ? toFormEntity(row) : null;
  }

  async findByCreatedBy(createdBy: string): Promise<Form[]> {
    const rows = await this.prisma.form.findMany({
      where: { createdBy },
      orderBy: { createdAt: "desc" },
      include: folderInclude,
    });
    return rows.map(toFormEntity);
  }

  async update(id: string, data: UpdateFormInput): Promise<Form | null> {
    const updateData: {
      title?: string;
      description?: string;
      closingMessage?: string | null;
      pausedMessage?: string | null;
      folderId?: string | null;
      isTemplate?: boolean;
      status?: string;
      slug?: string | null;
      allowAnonymous?: boolean;
    } = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.closingMessage !== undefined) updateData.closingMessage = data.closingMessage;
    if (data.pausedMessage !== undefined) updateData.pausedMessage = data.pausedMessage;
    if (data.folderId !== undefined) updateData.folderId = data.folderId;
    if (data.isTemplate !== undefined) updateData.isTemplate = data.isTemplate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.allowAnonymous !== undefined) updateData.allowAnonymous = data.allowAnonymous;
    const row = await this.prisma.form.update({
      where: { id },
      data: updateData,
      include: folderInclude,
    });
    return toFormEntity(row);
  }

  async setVersion(id: string, version: number): Promise<Form | null> {
    try {
      const row = await this.prisma.form.update({
        where: { id },
        data: { version },
        include: folderInclude,
      });
      return toFormEntity(row);
    } catch {
      return null;
    }
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
    const existing = await this.prisma.form.findUnique({
      where: { id },
      include: folderInclude,
    });
    if (!existing) return null;
    const row = await this.prisma.form.create({
      data: {
        title: `${existing.title} (cópia)`,
        description: existing.description,
        closingMessage: existing.closingMessage,
        pausedMessage: existing.pausedMessage,
        folderId: existing.folderId,
        isTemplate: false,
        status: "draft",
        version: 1,
        createdBy: createdBy || null,
        slug: null,
        allowAnonymous: existing.allowAnonymous,
      },
      include: folderInclude,
    });
    return toFormEntity(row);
  }
}
