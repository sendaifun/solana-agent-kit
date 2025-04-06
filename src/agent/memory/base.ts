export interface VectorStore {
  insert(vectors: number[][], ids: string[], payloads: Record<string, any>[]): Promise<void>;
  search(query: number[], limit?: number, filters?: SearchFilters): Promise<VectorStoreResult[]>;
  get(vectorId: string): Promise<VectorStoreResult | null>;
  delete(vectorId: string): Promise<void>;
}

export interface SearchFilters {
  [key: string]: any;
}

export interface VectorStoreResult {
  id: string;
  payload: Record<string, any>;
  score?: number;
}

export interface VectorStoreConfig {
  dimension?: number;
  collectionName: string;
  dbPath?: string;
}
