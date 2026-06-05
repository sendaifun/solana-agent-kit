# AGENTS.md

This file provides Codex guidance for the `solana-agent-kit` core package.

## Package Overview

`packages/core` is the main SDK package. It exports the `SolanaAgentKit` class, wallet utilities, action execution helpers, and framework adapters for AI tool use.

## Commands

```bash
# From packages/core
pnpm run build
pnpm run clean
pnpm run test

# From the repository root
pnpm run build:core
pnpm run lint
pnpm run lint:fix
```

## Core Exports

The package entrypoint is `src/index.ts`. Keep new public core APIs exported there.

```typescript
export { SolanaAgentKit } from "./agent";
export { createVercelAITools } from "./vercel-ai";
export { createLangchainTools } from "./langchain";
export { createOpenAITools } from "./openai";
export { createClaudeTools } from "./claude";
export * from "./types";
export * from "./types/wallet";
export * from "./utils/actionExecutor";
export * from "./utils/send_tx";
export * from "./utils/keypairWallet";
```

## Architecture

`SolanaAgentKit` composes plugin methods and actions:

```typescript
class SolanaAgentKit<TPlugins = Record<string, never>> {
  connection: Connection;
  config: Config;
  wallet: BaseWallet;
  evmWallet?: EvmWallet;
  methods: TPlugins;
  actions: Action[];

  use<P extends Plugin>(plugin: P): SolanaAgentKit<TPlugins & PluginMethods<P>>;
}
```

Plugin methods are merged into `agent.methods` with type inference. Actions are converted into framework-specific tools by the adapters.

## Adapter Pattern

Framework adapters live under `src/<framework>/index.ts`.

- Accept `(solanaAgentKit: SolanaAgentKit, actions: Action[])`.
- Convert each `Action` into the target framework's tool representation.
- Use `executeAction(action, solanaAgentKit, params)` when possible so validation and response handling stay consistent.
- Preserve the existing action count limit behavior consistently across adapters.

Use `@solana-agent-kit/adapter-mcp` for Codex integration. Codex consumes tools over MCP instead of using an in-process `createCodexTools` helper.

## Key Files

- `src/agent/index.ts` defines `SolanaAgentKit`.
- `src/types/index.ts` defines `Plugin`, `Config`, and core response types.
- `src/types/action.ts` defines action helper types.
- `src/types/wallet.ts` defines wallet interfaces.
- `src/utils/actionExecutor.ts` validates action input and calls handlers.
- `src/utils/keypairWallet.ts` implements the default server-side wallet.

## Safety Notes

- Do not broaden wallet, transaction, or key handling behavior without targeted tests.
- Keep adapter changes narrowly scoped to schema conversion and action execution.
- Avoid adding runtime dependencies unless the target SDK requires them and exposes a stable tool abstraction.
