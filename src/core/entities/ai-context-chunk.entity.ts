export type EntityType = "form" | "response" | "dashboard";

export interface AIContextChunk {
  id: string;
  entityType: EntityType;
  entityId: string;
  content: string;
  embedding?: number[];
  createdAt: Date;
}
