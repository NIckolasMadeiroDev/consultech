import type { CreateFolderInput } from "./folder.schema";
import type { IFolderRepository } from "./folder.repository.interface";

export async function createFolder(
  data: CreateFolderInput,
  createdBy: string,
  folderRepository: IFolderRepository
) {
  const name = data.name.trim();
  if (!name) throw new Error("Nome da pasta é obrigatório");
  return folderRepository.create({ name, createdBy });
}
