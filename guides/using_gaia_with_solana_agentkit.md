# Using Gaia's OpenAI Compatible Nodes with Solana AgentKit

This guide explains how to integrate Gaia's OpenAI Compatible Nodes with Solana AgentKit to create AI agents that can interact with the Solana blockchain.

## What is Gaia?

Gaia provides OpenAI-compatible API endpoints that allow you to use various AI models through a unified interface. By using Gaia with Solana AgentKit, you can leverage different AI models while maintaining the same code structure.

## Prerequisites

Before you begin, you'll need:

1. Gaia API credentials:
   - `GAIA_NODE_URL`: The base URL for Gaia's OpenAI-compatible API endpoints
   - `GAIA_API_KEY`: Your Gaia API key for authentication
   - `GAIA_MODEL_NAME`: The name of the model you want to use

2. Solana credentials:
   - `RPC_URL`: A Solana RPC endpoint
   - `SOLANA_PRIVATE_KEY`: Your Solana wallet private key (base58 encoded)

## Integration Steps

### 1. Install Required Dependencies

```bash
npm install @ai-sdk/openai ai solana-agent-kit @solana/web3.js bs58 dotenv
```

### 2. Set Up Environment Variables

Create a `.env` file with your credentials:

```
# Gaia Configuration
GAIA_NODE_URL=https://your-gaia-node-url/v1
GAIA_API_KEY=your-gaia-api-key
GAIA_MODEL_NAME=your-preferred-model-name

# Solana Configuration
RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your-solana-private-key-in-base58
```

### 3. Initialize Solana AgentKit

```typescript
import { SolanaAgentKit, KeypairWallet, createVercelAITools } from 'solana-agent-kit';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Solana wallet
const privateKeyBytes = bs58.decode(process.env.SOLANA_PRIVATE_KEY!);
const keypair = Keypair.fromSecretKey(privateKeyBytes);
const wallet = new KeypairWallet(keypair, process.env.RPC_URL!);

// Initialize SolanaAgentKit
const agent = new SolanaAgentKit(wallet, process.env.RPC_URL!);

// Create tools from agent actions
const tools = createVercelAITools(agent, agent.actions);
```

### 4. Configure Gaia with OpenAI-Compatible SDK

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Initialize OpenAI client with Gaia configuration
const openAI = createOpenAI({
  apiKey: process.env.GAIA_API_KEY!,
  baseURL: process.env.GAIA_NODE_URL,
});
```

### 5. Use the AI Model with Tools

```typescript
// Example: Generate a response using Gaia's model
const response = await generateText({
  model: openAI(process.env.GAIA_MODEL_NAME!),
  messages: [{ role: 'user', content: 'What is my SOL balance?' }],
  tools,
  temperature: 0.7,
});

// Process the response
console.log(response.content);
```

## Advanced Usage

### Streaming Responses

You can stream responses from the model:

```typescript
const response = await generateText({
  model: openAI(process.env.GAIA_MODEL_NAME!),
  messages: [{ role: 'user', content: 'What is my SOL balance?' }],
  tools,
  temperature: 0.7,
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.content);
}
```

### Adding Custom Plugins

You can extend the functionality by adding custom plugins:

```typescript
import { TokenPlugin } from '@solana-agent-kit/plugin-token';
import { DefiPlugin } from '@solana-agent-kit/plugin-defi';

// Add plugins to the agent
agent.use(new TokenPlugin());
agent.use(new DefiPlugin());
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify your `GAIA_NODE_URL` is correct and includes the `/v1` path
   - Check that your `GAIA_API_KEY` is valid
   - Ensure you're using the correct authentication method (Bearer token)

2. **Model Not Found**:
   - Ensure the `GAIA_MODEL_NAME` is available in your Gaia subscription
   - Use the `/v1/models` endpoint to list available models
   - Check Gaia's documentation for the correct model naming convention

3. **Streaming Response Issues**:
   - If you encounter "Response is not async iterable" errors, use non-streaming mode
   - Some Gaia endpoints might not support streaming in the same way as OpenAI
   - Modify your code to use `stream: false` in the generateText options

4. **Solana Transaction Errors**:
   - Verify your wallet has sufficient SOL for transactions
   - Check that your RPC URL is responsive
   - Ensure you're on the correct network (mainnet, devnet, testnet)

### Debugging Tips

1. Test the Gaia API connection separately:
   ```bash
   curl -X GET "$GAIA_NODE_URL/models" \
     -H "Authorization: Bearer $GAIA_API_KEY"
   ```

2. Test a simple completion request:
   ```bash
   curl -X POST "$GAIA_NODE_URL/chat/completions" \
     -H "Authorization: Bearer $GAIA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "your-model-name",
       "messages": [{"role": "user", "content": "Hello"}],
       "max_tokens": 10
     }'
   ```

3. Verify Solana connection:
   ```typescript
   const connection = new Connection(process.env.RPC_URL!);
   const balance = await connection.getBalance(wallet.publicKey);
   console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
   ```

## Example Projects

For a complete working example, check out the [gaia-agent-starter](../examples/misc/gaia-agent-starter) in the examples directory.

## Resources

- [Solana AgentKit Documentation](https://github.com/sendaifun/solana-agent-kit)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)