---
"@solana-agent-kit/plugin-misc": minor
---

Add `GET_WALLET_INTELLIGENCE` action powered by the Helius Enhanced Transactions API. Given a Solana wallet address, it decodes a wallet's recent on-chain activity into structured intelligence for AI agents: DEX swaps (with decoded token amounts), top venues/protocols, last activity, and trading-behavior signals. Exposed both as an agent action (`GET_WALLET_INTELLIGENCE`) and as programmatic methods (`getWalletEnhancedTransactions`, `summarizeWalletIntelligence`).
