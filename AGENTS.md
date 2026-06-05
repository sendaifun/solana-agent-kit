# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Build and Development Commands

```bash
# Install dependencies (requires pnpm 9+ and Node 22+)
pnpm install

# Build all packages
pnpm run build

# Build specific packages
pnpm run build:core
pnpm run build:plugin-token
pnpm run build:plugin-defi
pnpm run build:plugin-nft
pnpm run build:plugin-misc
pnpm run build:plugin-blinks
pnpm run build:adapter-mcp

# Lint and format
pnpm run lint
pnpm run lint:fix
pnpm run format

# Run tests. This is interactive and requires test/.env values.
pnpm run test

# Generate documentation
pnpm run docs

# Clean all build artifacts
pnpm run clean
```

## Repository Architecture

This is a pnpm workspace and Turborepo monorepo for building AI agents that interact with Solana protocols.

### Package Structure

```text
packages/
  core/           solana-agent-kit core SDK and SolanaAgentKit class
  plugin-token/   token transfers, swaps, Jupiter, PumpFun
  plugin-defi/    Drift, Orca, Raydium, Meteora, and other DeFi protocols
  plugin-nft/     NFT operations through Metaplex, 3Land, and others
  plugin-misc/    utilities such as CoinGecko, Allora, domains, webhooks
  plugin-blinks/  Solana Blinks actions
  adapter-mcp/    Model Context Protocol server adapter
```

## Core Concepts

V2 uses a composable plugin architecture. Plugins register direct methods for programmatic use and actions for AI agent tool use.

```typescript
interface Plugin {
  name: string;
  methods: Record<string, Function>;
  actions: Action[];
  initialize(agent: SolanaAgentKit): void;
}

interface Action {
  name: string;
  similes: string[];
  description: string;
  examples: ActionExample[][];
  schema: z.ZodType<any>;
  handler: Handler;
}
```

Initialize agents by composing plugins:

```typescript
const agent = new SolanaAgentKit(wallet, rpcUrl, config)
  .use(TokenPlugin)
  .use(DefiPlugin);

await agent.methods.trade(...);

const tools = createVercelAITools(agent, agent.actions);
```

## AI and MCP Integrations

- `createVercelAITools(agent, actions)` converts actions for the Vercel AI SDK.
- `createLangchainTools(agent, actions)` converts actions for LangChain.
- `createOpenAITools(agent, actions)` converts actions for the OpenAI Agents SDK.
- `createClaudeTools(agent, actions)` converts actions for the Claude Agents SDK.
- `@solana-agent-kit/adapter-mcp` exposes selected actions through MCP for MCP clients such as Claude Desktop and Codex.

Codex does not need a separate in-process action adapter. Use the MCP adapter when Codex should call Solana Agent Kit actions.

## Code Style

- Use Biome for linting and formatting.
- Keep TypeScript ESM-compatible.
- Prefer camelCase for functions and variables, PascalCase for types and classes.
- Follow Conventional Commits for commit messages.
- Keep public APIs typed and exported through package entrypoints.

## Safety Notes

- Do not commit private keys, RPC credentials, API keys, or generated wallet files.
- When documenting MCP examples, expose only a minimal action set by default.
- Prefer devnet or low-risk read-only actions in examples.
- After changing package source, run the targeted package build and `pnpm run lint` when dependencies are available.
