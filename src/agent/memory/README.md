# Memory Module for SolanaAgentKit

This module provides a simple vector store implementation for the SolanaAgentKit, allowing agents to store and retrieve memories using vector embeddings.

## Features

- SQLite-based vector storage
- OpenAI embeddings integration
- Cosine similarity search
- Basic CRUD operations for memories

## Usage

### Basic Usage

```typescript
import { SolanaAgentKit } from '../agent';

// Initialize the agent with your private key, RPC URL, and OpenAI API key
const agent = new SolanaAgentKit(privateKey, rpcUrl, {
  OPENAI_API_KEY: 'your-openai-api-key'
});

// Store a text memory
await agent.storeTextMemory('memory1', 'Solana is a high-performance blockchain platform.');

// Search for memories related to a query
const results = await agent.searchTextMemories('Tell me about Solana', 5);

// Get a specific memory
const memory = await agent.getMemory('memory1');

// Delete a memory
await agent.deleteMemory('memory1');
```

### Advanced Usage

You can also work directly with vector embeddings:

```typescript
// Store a memory with a custom vector and payload
await agent.storeMemory('memory1', vector, { text: 'Custom memory', metadata: { source: 'user' } });

// Search for memories using a vector
const results = await agent.searchMemories(vector, 5);
```

## Implementation Details

The memory module consists of the following components:

1. **VectorStore Interface**: Defines the core operations for vector storage and retrieval.
2. **MemoryVectorStore Class**: Implements the VectorStore interface using SQLite.
3. **Embeddings Utility**: Provides functions for generating embeddings using OpenAI's API.

## Database Structure

The SQLite database stores vectors in the following table:

```sql
CREATE TABLE IF NOT EXISTS vectors (
  id TEXT PRIMARY KEY,
  vector BLOB NOT NULL,
  payload TEXT NOT NULL
)
```

- `id`: A unique identifier for the vector
- `vector`: The vector data stored as a binary blob
- `payload`: JSON-serialized metadata associated with the vector

## Dependencies

- sqlite3: For local vector storage
- openai: For generating embeddings

## Example

See `src/examples/memory-example.ts` for a complete example of how to use the memory module. 