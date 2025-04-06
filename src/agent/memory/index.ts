import { VectorStore, VectorStoreConfig, VectorStoreResult, SearchFilters } from './base';
import { initializeDatabase, cosineSimilarity } from './utils';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Define the database row type
interface VectorRow {
  id: string;
  vector: Buffer;
  payload: string;
}

export class MemoryVectorStore implements VectorStore {
  private db: sqlite3.Database;
  private dimension: number;

  constructor(config: VectorStoreConfig) {
    this.dimension = config.dimension || 1536;
    
    // Ensure the memory directory exists
    const memoryDir = path.join(process.cwd(), 'src', 'agent', 'memory');
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }
    
    // Set the database path within the memory directory
    const dbPath = config.dbPath || path.join(memoryDir, 'vector_store.db');
    this.db = new sqlite3.Database(dbPath);
    initializeDatabase(this.db).catch(console.error);
  }

  async insert(vectors: number[][], ids: string[], payloads: Record<string, any>[]): Promise<void> {
    if (vectors.length !== ids.length || vectors.length !== payloads.length) {
      throw new Error('Vectors, IDs, and payloads must have the same length');
    }

    for (let i = 0; i < vectors.length; i++) {
      const vector = vectors[i];
      const id = ids[i];
      const payload = payloads[i];

      if (vector.length !== this.dimension) {
        throw new Error(`Vector dimension (${vector.length}) does not match expected dimension (${this.dimension})`);
      }

      const vectorBuffer = Buffer.from(new Float32Array(vector).buffer);
      const payloadString = JSON.stringify(payload);

      await new Promise<void>((resolve, reject) => {
        this.db.run(
          'INSERT OR REPLACE INTO vectors (id, vector, payload) VALUES (?, ?, ?)',
          [id, vectorBuffer, payloadString],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async search(query: number[], limit: number = 5, filters?: SearchFilters): Promise<VectorStoreResult[]> {
    if (query.length !== this.dimension) {
      throw new Error(`Query vector dimension (${query.length}) does not match expected dimension (${this.dimension})`);
    }

    return new Promise<VectorStoreResult[]>((resolve, reject) => {
      this.db.all('SELECT id, vector, payload FROM vectors', [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const results: VectorStoreResult[] = (rows as VectorRow[]).map(row => {
          const vectorBuffer = row.vector;
          const vector = Array.from(new Float32Array(vectorBuffer.buffer));
          const payload = JSON.parse(row.payload);
          const score = cosineSimilarity(query, vector);

          return {
            id: row.id,
            payload,
            score
          };
        });

        // Sort by similarity score (descending) and limit results
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        resolve(results.slice(0, limit));
      });
    });
  }

  async get(vectorId: string): Promise<VectorStoreResult | null> {
    return new Promise<VectorStoreResult | null>((resolve, reject) => {
      this.db.get('SELECT id, vector, payload FROM vectors WHERE id = ?', [vectorId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const vectorRow = row as VectorRow;
        const vectorBuffer = vectorRow.vector;
        const vector = Array.from(new Float32Array(vectorBuffer.buffer));
        const payload = JSON.parse(vectorRow.payload);

        resolve({
          id: vectorRow.id,
          payload
        });
      });
    });
  }

  async delete(vectorId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.run('DELETE FROM vectors WHERE id = ?', [vectorId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
