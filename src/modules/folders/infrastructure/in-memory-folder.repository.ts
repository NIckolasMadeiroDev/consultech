import { randomUUID } from "node:crypto";
import type { FormFolderRecord, IFolderRepository } from "../folder.repository.interface";

const folderStore = new Map<string, FormFolderRecord>();

export function getInMemoryFolderDisplayName(folderId: string): string | undefined {
  return folderStore.get(folderId)?.name;
}

export class InMemoryFolderRepository implements IFolderRepository {
  async findByCreatedBy(createdBy: string): Promise<FormFolderRecord[]> {
    return Array.from(folderStore.values())
      .filter((f) => f.createdBy === createdBy)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  async create(data: { name: string; createdBy: string }): Promise<FormFolderRecord> {
    const dup = Array.from(folderStore.values()).some(
      (f) => f.createdBy === data.createdBy && f.name === data.name
    );
    if (dup) throw new Error("Já existe uma pasta com esse nome");
    const now = new Date();
    const rec: FormFolderRecord = {
      id: randomUUID(),
      name: data.name,
      createdBy: data.createdBy,
      createdAt: now,
    };
    folderStore.set(rec.id, rec);
    return rec;
  }
}

export function clearFolderStore(): void {
  folderStore.clear();
}
