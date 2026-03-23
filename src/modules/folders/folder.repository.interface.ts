export type FormFolderRecord = {
  id: string;
  name: string;
  createdBy: string | null;
  createdAt: Date;
};

export interface IFolderRepository {
  findByCreatedBy(createdBy: string): Promise<FormFolderRecord[]>;
  create(data: { name: string; createdBy: string }): Promise<FormFolderRecord>;
}
