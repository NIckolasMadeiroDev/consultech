import type { AIContextChunk } from "@/core/entities";

export interface IAIContextRepository {
  upsert(chunk: Omit<AIContextChunk, "id" | "createdAt">): Promise<AIContextChunk>;
  searchByEmbedding(embedding: number[], limit?: number, entityTypes?: string[]): Promise<AIContextChunk[]>;
  findByEntity(entityType: string, entityId: string): Promise<AIContextChunk[]>;
  deleteByEntity(entityType: string, entityId: string): Promise<void>;
}
