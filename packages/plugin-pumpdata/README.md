# @solana-agent-kit/plugin-pumpdata

pump.fun history for agents, from [pumpdata.fun](https://pumpdata.fun): Every pump.fun trade, ever.

The agent asks about a coin, a deployer or a set of wallets and pays per call in USDC on Solana over [x402](https://x402.org), from its own wallet. No account and no API key. A daily summary is free.

## Installation

```bash
npm install solana-agent-kit @solana-agent-kit/plugin-pumpdata
```

## Usage

```typescript
import { KeypairWallet, SolanaAgentKit } from "solana-agent-kit";
import PumpDataPlugin from "@solana-agent-kit/plugin-pumpdata";

const agent = new SolanaAgentKit(wallet, "YOUR_MAINNET_RPC_URL", {}).use(
  PumpDataPlugin,
);

// Free: yesterday on pump.fun
const stats = await agent.methods.pumpdataGetStats(agent);
console.log(stats.data.summary);

// $0.005: a launch's history and how launches like it went
const launch = await agent.methods.pumpdataGetLaunch(agent, "MINT_ADDRESS");
console.log(launch.data.summary, launch.dataAsOf, launch.payment?.transaction);
```

## Tools

| Tool | Action | Price | What it answers |
|------|--------|-------|-----------------|
| `pumpdataGetStats` | `PUMPDATA_GET_STATS` | free | One UTC day on pump.fun: launches, graduations, volume, traders, top coins and deployers |
| `pumpdataGetLaunch` | `PUMPDATA_GET_LAUNCH` | $0.005 | A launch's deployer record, bundle at creation, insiders' share, curve progress, and how similar launches went over their next 24 h |
| `pumpdataGetWallets` | `PUMPDATA_GET_WALLETS` | $0.01 | Up to 50 wallets' records: rule-based class, SOL in and out, net SOL, coins, first seen |
| `pumpdataGetDeployer` | `PUMPDATA_GET_DEPLOYER` | $0.005 | A deployer's launches, graduations, best run, last 90 days, and the base rate for its next launch |
| `pumpdataGetSimilar` | `PUMPDATA_GET_SIMILAR` | $0.005 | The past launches most like this one at the same age, by mint, and how each went over its next 24 h |
| `pumpdataGetBaseRate` | `PUMPDATA_GET_BASE_RATE` | $0.005 | For a market cap band and window: how many coins crossed it and the share that reached 2x, 5x, 10x, 20x within 3 h |

Every answer carries `dataAsOf` (the build it comes from) and `dataFrom` (where the data begins). Wallet classes (`winner`, `bot`, `supply_seller`, `new`, `none`) are rules defined by pumpdata.fun, not judgements; report them with the SOL behind them. Full definitions: [llms.txt](https://pumpdata.fun/llms.txt), [openapi.json](https://pumpdata.fun/openapi.json).

## How payment works

1. The tool sends the request unpaid. pumpdata.fun answers `402` with an x402 v2 offer: scheme `exact`, network Solana mainnet, asset USDC, the amount, the recipient, and a facilitator that pays the network fee.
2. The plugin builds the USDC `transferChecked` with [`@x402/svm`](https://www.npmjs.com/package/@x402/svm) and asks the agent's wallet (`agent.wallet.signTransaction`, any `BaseWallet`) to sign it as the transfer's authority. The wallet does not send anything; the facilitator co-signs as fee payer and lands it.
3. [`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch) retries the request with the `PAYMENT-SIGNATURE` header. The answer comes back with the receipt in `PAYMENT-RESPONSE`, returned as `payment`.

Limits the plugin enforces:

- Each call pays at most its listed price above. A 402 asking for more, or for another network or asset, is refused before anything is signed.
- The free `stats` call never pays, even if it were to answer 402.
- If the wallet changes the transaction while signing, the payment is refused.

What the agent needs:

- USDC on Solana mainnet in the wallet's USDC token account. No SOL is spent on fees.
- A mainnet RPC URL on the agent; it is used to read the USDC mint and a recent blockhash.

## Errors

Tools throw `PumpDataApiError` with the HTTP `status` and pumpdata.fun's `error` code; actions return `{ status: "error", message }`. A `400` or `404` means nothing was charged. A `402` after paying means the payment was refused and nothing settled. A `503` `payment_settle_uncertain` means the payment may have settled: do not pay again without checking.

## Tests

```bash
pnpm --filter @solana-agent-kit/plugin-pumpdata test
# live, unpaid checks against pumpdata.fun (never pays):
PUMPDATA_LIVE=1 pnpm --filter @solana-agent-kit/plugin-pumpdata test
```
