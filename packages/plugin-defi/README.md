# @solana-agent-kit/plugin-defi

DeFi plugin for Solana Agent Kit - enables swaps, lending, liquidity provision, and more.

## Installation

```bash
npm install @solana-agent-kit/plugin-defi
```

## Supported Protocols

- Jupiter (swap aggregator)
- Raydium (AMM)
- Orca Whirlpools (concentrated liquidity)
- Meteora DLMM
- Drift (perps & lending)
- Flash (lending)
- OKX DEX
- Pump.fun swap
- Manifest
- Voltr vaults

## Usage

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import DefiPlugin from "@solana-agent-kit/plugin-defi";

const agent = new SolanaAgentKit(wallet, rpcUrl, options)
  .use(DefiPlugin);

// Now you can use DeFi methods
await agent.swap(inputMint, outputMint, amount);
```

## Features

- Token swaps across multiple DEXs
- Liquidity provision and management
- Lending and borrowing
- Perpetual futures trading (Drift)
- Vault strategies

## Dependencies

This plugin depends on:
- `@solana/web3.js` (peer dependency)
- Various Solana DeFi protocol SDKs

## License

MIT
