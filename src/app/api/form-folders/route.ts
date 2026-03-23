import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { createFolderSchema } from "@/modules/folders/folder.schema";
import { createFolder } from "@/modules/folders/create-folder";
import { getFolderRepository } from "@/infrastructure/database/repositories";
import { getCreatedBy } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const createdBy = await getCreatedBy(req);
    const folderRepo = getFolderRepository();
    return folderRepo.findByCreatedBy(createdBy);
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const body = await req.json();
    const data = createFolderSchema.parse(body);
    const createdBy = await getCreatedBy(req);
    const folderRepo = getFolderRepository();
    return createFolder(data, createdBy, folderRepo);
  });
}
