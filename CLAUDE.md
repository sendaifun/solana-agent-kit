# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (requires pnpm 9+, Node 22+)
pnpm install

# Build all packages
pnpm run build

# Build specific packages
pnpm run build:core              # Core package only
pnpm run build:plugin-token      # Token plugin
pnpm run build:plugin-defi       # DeFi plugin
pnpm run build:plugin-nft        # NFT plugin
pnpm run build:plugin-misc       # Misc plugin
pnpm run build:plugin-blinks     # Blinks plugin
pnpm run build:plugin-h081       # H081 plugin
pnpm run build:adapter-mcp       # MCP adapter

# Lint and format
pnpm run lint                    # Check with Biome
pnpm run lint:fix                # Auto-fix lint issues
pnpm run format                  # Format code with Biome

# Run tests (interactive - prompts for "agent" or "programmatic" mode)
# Requires OPENAI_API_KEY, RPC_URL, SOLANA_PRIVATE_KEY in test/.env
pnpm run test

# Generate documentation
pnpm run docs

# Clean all build artifacts
pnpm run clean
```

## Architecture Overview

This is a **monorepo using pnpm workspaces and Turborepo** for building AI agents that interact with Solana protocols.

### Package Structure

```
packages/
├── core/           # solana-agent-kit - Main SDK with SolanaAgentKit class
├── plugin-token/   # Token operations (transfers, swaps, Jupiter, PumpFun)
├── plugin-defi/    # DeFi protocols (Drift, Orca, Raydium, Meteora, etc.)
├── plugin-nft/     # NFT operations (Metaplex, 3Land)
├── plugin-misc/    # Utilities (CoinGecko, Allora, domains, webhooks)
├── plugin-blinks/  # Solana Blinks (arcade games)
├── plugin-h081/    # H081 Capital private bank (shielded USDG, loans, H081 staking)
└── adapter-mcp/    # Model Context Protocol server adapter
```

### Core Concepts

**Plugin System**: V2 uses a composable plugin architecture. Plugins register `methods` (direct function calls) and `actions` (AI agent tools with schemas).

```typescript
// Plugin structure
interface Plugin {
  name: string;
  methods: Record<string, Function>;  // Programmatic API
  actions: Action[];                   // AI agent tools with Zod schemas
  initialize(agent: SolanaAgentKit): void;
}

// Action structure for AI tools
interface Action {
  name: string;
  similes: string[];           // Alternative trigger phrases
  description: string;
  examples: ActionExample[][];
  schema: z.ZodType<any>;      // Input validation
  handler: Handler;            // Execution function
}
```

**Agent Initialization**:
```typescript
const agent = new SolanaAgentKit(wallet, rpcUrl, config)
  .use(TokenPlugin)
  .use(DefiPlugin);

// Methods are type-safe on agent.methods
await agent.methods.trade(...);

// Actions exposed via agent.actions for AI frameworks
const tools = createVercelAITools(agent, agent.actions);
```

**Wallet Interface**: Uses `BaseWallet` interface - can be `KeypairWallet` for server-side or wallet adapter for browser.

### AI Framework Integration

- `createVercelAITools(agent, actions)` - For Vercel AI SDK
- `createLangchainTools(agent, actions)` - For LangChain
- `createOpenAITools(agent, actions)` - For OpenAI Agents SDK

### Plugin Organization Pattern

Each plugin follows this structure:
```
plugin-*/src/
├── index.ts           # Plugin definition, exports methods & actions
├── protocol-name/
│   ├── actions/       # Action definitions (AI tool schemas)
│   ├── tools/         # Implementation functions
│   └── types/         # TypeScript types (optional)
```

**Actions vs Tools**: Actions wrap tools with Zod schemas, descriptions, and examples for AI agent consumption. Tools contain the actual implementation logic.

## Code Style

- **Linting/Formatting**: Biome (not ESLint/Prettier for main code)
- **Commit Messages**: Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Naming**: camelCase for functions/variables, PascalCase for types/classes
- TypeScript strict mode, ESM modules

## Key Files

- `packages/core/src/agent/index.ts` - SolanaAgentKit class definition
- `packages/core/src/types/index.ts` - Core types (Plugin, Action, Config)
- `packages/core/src/types/wallet.ts` - Wallet interface definitions
- `turbo.json` - Turborepo build configuration
- `biome.json` - Linting and formatting rules
