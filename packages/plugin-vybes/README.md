# @solana-agent-kit/plugin-vybes

[Vybes.fun](https://vybes.fun) integration for the Solana Agent Kit. Launch meme tokens, generate AI logos, create prediction markets, and check earnings — all from your AI agent.

## Features

- **Token Launch** — Deploy a Solana meme token with bonding curve and AI-generated logo. Free to launch (0 SOL creation fee). Tokens graduate to Meteora DEX at ~85 SOL raised.
- **AI Logo Generation** — Generate 1024x1024 PNG logos via Workers AI (FLUX model). 10 styles: meme, cute, cool, hype, moon, pixel, anime, 3d, logo, degen. Free, rate limited to 20/hour.
- **Prediction Markets** — Create YES/NO prediction markets on any Solana token. 6 template types (graduation, market_cap_target, multiplier, ath_flip, holder_count, volume_target). Auto-resolved by cron.
- **Earnings** — Check tokens launched, prediction bets, payouts, and net profit for any wallet.

## Installation

```bash
pnpm add @solana-agent-kit/plugin-vybes
```

## Usage

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import VybesPlugin from "@solana-agent-kit/plugin-vybes";

const agent = new SolanaAgentKit(wallet, rpcUrl, config)
  .use(VybesPlugin);

// Launch a token
const token = await agent.methods.launchTokenOnVybes(agent, {
  name: "Moon Dog",
  symbol: "MDOG",
  description: "The moon-iest dog token",
  style: "meme",
});

// Generate a logo
const logo = await agent.methods.generateVybesLogo({
  name: "Moon Dog",
  symbol: "MDOG",
  style: "pixel",
});

// Create a prediction market
const prediction = await agent.methods.createVybesPrediction({
  wallet: agent.wallet.publicKey.toBase58(),
  tokenMint: token.tokenAddress,
  question: "Will MDOG graduate in 24h?",
  templateType: "graduation",
  duration: "24h",
});

// Check earnings
const earnings = await agent.methods.getVybesEarnings(
  agent.wallet.publicKey.toBase58(),
);
```

## Actions (AI Agent Tools)

| Action | Name | Description |
|--------|------|-------------|
| Launch Token | `LAUNCH_VYBES_TOKEN` | Launch a meme token with bonding curve + AI logo |
| Generate Logo | `GENERATE_VYBES_LOGO` | Generate AI logo (10 styles, free) |
| Create Prediction | `CREATE_VYBES_PREDICTION` | Create YES/NO prediction market |

## Methods (Programmatic API)

| Method | Description |
|--------|-------------|
| `launchTokenOnVybes` | Full launch flow: fee check, logo gen, payment, token creation |
| `generateVybesLogo` | Generate AI logo via FLUX model |
| `createVybesPrediction` | Create prediction market with template |
| `getVybesEarnings` | Get earnings summary for a wallet |

## Links

- [Vybes.fun](https://vybes.fun)
- [Developer Docs](https://vybes.fun/developers)
- [Plugin Source](https://github.com/AICre8dev/solana-agent-kit-vybes)
