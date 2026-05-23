# @solana-agent-kit/plugin-sentinel

AI Safety Validation Plugin for Solana Agent Kit implementing the THSP (Truth-Harm-Scope-Purpose) protocol.

## Overview

The Sentinel plugin protects AI agents from executing harmful, unauthorized, or suspicious transactions on Solana. Every transaction passes through four validation gates before execution.

## Installation

```bash
npm install @solana-agent-kit/plugin-sentinel
```

## Usage

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import SentinelPlugin from "@solana-agent-kit/plugin-sentinel";

const agent = new SolanaAgentKit(privateKey, rpcUrl)
  .use(SentinelPlugin);

// Validate before any transaction
const result = await agent.methods.validateTransaction({
  action: "transfer",
  amount: 50,
  recipient: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  purpose: "Payment for NFT purchase",
});

if (result.shouldProceed) {
  // Safe to execute
} else {
  console.log("Blocked:", result.concerns);
}
```

## THSP Protocol

Every transaction is validated against four gates:

| Gate | Question | Checks |
|------|----------|--------|
| **Truth** | Is the data accurate? | Address format, valid amounts, program IDs |
| **Harm** | Could this cause damage? | Blocked addresses, high-risk actions |
| **Scope** | Is this within limits? | Amount limits, rate limits |
| **Purpose** | Is there legitimate benefit? | Explicit justification for sensitive operations |

## Available Actions

| Action | Description |
|--------|-------------|
| `SENTINEL_VALIDATE_TRANSACTION` | Full THSP validation with gate analysis |
| `SENTINEL_CHECK_SAFETY` | Quick pass/fail safety check |
| `SENTINEL_GET_SAFETY_STATS` | Get validation statistics |
| `SENTINEL_BLOCK_ADDRESS` | Add address to blocklist |
| `SENTINEL_UNBLOCK_ADDRESS` | Remove address from blocklist |

## Methods

```typescript
// Full validation
agent.methods.validateTransaction({ action, amount, recipient, purpose })

// Quick check
agent.methods.checkSafety(action, amount, recipient)

// Statistics
agent.methods.getSafetyStats()

// Address management
agent.methods.blockAddress(address)
agent.methods.unblockAddress(address)

// Configuration
agent.methods.updateSafetyConfig({ maxTransactionAmount: 100 })
```

## Risk Levels

| Level | Description | Action |
|-------|-------------|--------|
| `low` | No concerns | Proceed |
| `medium` | Minor concerns | Proceed with caution |
| `high` | Significant concerns | Review carefully |
| `critical` | Serious issues | Blocked |

## Default Configuration

```typescript
{
  maxTransactionAmount: 100,    // Max SOL per transaction
  confirmationThreshold: 10,    // Require confirmation above this
  blockedAddresses: [],         // Known scam addresses
  allowedPrograms: [],          // Whitelist (empty = all allowed)
  requirePurposeFor: ["transfer", "swap", "approve", "bridge", "withdraw", "stake"],
  strictMode: false,            // Block all transactions with concerns
}
```

## Links

- [Sentinel Documentation](https://sentinelseed.dev/docs)
- [THSP Protocol](https://sentinelseed.dev/docs/thsp)

## License

Apache-2.0
