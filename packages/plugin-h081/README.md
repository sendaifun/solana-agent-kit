# @solana-agent-kit/plugin-h081

Solana Agent Kit plugin for [H081 Capital](https://www.h081.xyz), the private bank for AI agents on Solana. It gives an agent seven actions: shielded USDG deposits and withdrawals, the balance, loan quotes and loan pledges, H081 staking, and the protocol's facts. The actions work with every Agent Kit adapter (`createVercelAITools`, `createLangchainTools`, `createOpenAITools`) and are also plain methods on the agent.

H081 Capital is **live on Solana mainnet**. It is **not audited yet**. **Use at your own risk**, with a dedicated, low-balance agent key.

## Install

```sh
npm install solana-agent-kit @solana-agent-kit/plugin-h081 @solana/web3.js
```

Node 20.11 or newer. The proving artifacts (~75 MB) are not in the package: they are downloaded from `https://www.h081.xyz/circuits/` into `H081_CIRCUITS_DIR` (default `~/.h081/circuits`) the first time a circuit is needed, and every file's sha256 is checked against the hashes pinned in the package before it is written. A deposit or withdrawal needs `transact` (15 MB); a loan pledge also needs `grant` (44 MB) and `stream`.

## Worked example (Vercel AI SDK)

```ts
import { readFileSync } from "node:fs";
import { Keypair } from "@solana/web3.js";
import { SolanaAgentKit, KeypairWallet, createVercelAITools } from "solana-agent-kit";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import H081Plugin from "@solana-agent-kit/plugin-h081";

// a dedicated agent key: it pays fees, holds the USDG that goes in and out, and derives the shielded account
const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(process.env.AGENT_KEYPAIR!, "utf8"))));
const rpc = process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com";

const agent = new SolanaAgentKit(new KeypairWallet(keypair, rpc), rpc, {}).use(H081Plugin);
const tools = createVercelAITools(agent, agent.actions);

const { text } = await generateText({
  model: openai("gpt-4o"),
  tools,
  maxSteps: 6,
  prompt: "Check the H081 protocol info, deposit 25 USDG into my private bank account, then show my balance and withdraw 10 USDG back to my wallet.",
});
console.log(text);
```

What the model does, action by action:

1. `H081_PROTOCOL_INFO {}`: the programs, the live caps and pause flag, the relayer's terms (0.05 USDG minimum, 0.20 %, paid to the protocol treasury), the agent's wallet and shielded address.
2. `H081_BANK_DEPOSIT {"usdg": "25"}`: the plugin reads the caps and the wallet balances and refuses at once if the deposit is over 1,000 USDG, would push the bank over 10,000 USDG, deposits are paused, or the wallet lacks the USDG or ~0.02 SOL (buffer rent, refunded, plus fees); otherwise it makes the `transact` proof, stages it in a program buffer and sends the deposit. `{"status": "success", "signature": "...", "amount": "25000000", "amountUsdg": "25", "shielded": "25000000", "shieldedUsdg": "25"}`.
3. `H081_BANK_BALANCE {}`: `{"status": "success", "shieldedUsdg": "25", "walletUsdgHuman": "75", "walletSol": 0.19, "caps": {...}}`.
4. `H081_BANK_WITHDRAW {"usdg": "10"}`: sent by the relayer (the agent wallet is not the sender on chain) for the smallest fee it accepts: `{"amount": "10000000", "fee": "50000", "received": "9950000", "receivedUsdg": "9.95", "via": "relayer"}`. `"direct": true` has the agent key send it instead, with no relay fee. When the relayer is unreachable or refuses, the action returns `{"status": "error", "message": "the relayer ... The withdrawal was not sent: retry later, or pass direct: true ..."}` and nothing moves; it never falls back to a direct send by itself. Above the relayer's free tier (100 USDG per 30 days) the agent wallet is named as capacity operator and needs H081 staked (`H081_STAKE`); otherwise the withdrawal is refused before any proof, naming the free tier, the stake and `direct: true`.

A refused action returns `{"status": "error", "message": "DepositCapExceeded (6037, stipend_pool): the bank holds at most 10,000 USDG in total..."}`; handlers never throw.

The same without a model, as plain methods (the agent is the first argument):

```ts
await agent.methods.h081ProtocolInfo(agent);
await agent.methods.h081BankDeposit(agent, { usdg: "25" });
await agent.methods.h081BankBalance(agent);
await agent.methods.h081BankWithdraw(agent, { usdg: "10" });
await agent.methods.h081Stake(agent, { action: "view" });
```

Every method returns plain JSON (bigints as decimal strings).

## Actions

| Action | Similes include | Input |
|---|---|---|
| `H081_BANK_DEPOSIT` | `h081_bank_deposit` | `{amount}` base units or `{usdg}` decimal |
| `H081_BANK_WITHDRAW` | `h081_bank_withdraw` | `{amount\|usdg, to?: wallet, direct?: boolean}` |
| `H081_BANK_BALANCE` | `h081_bank_balance` | `{}` |
| `H081_LOAN_QUOTE` | `h081_loan_quote` | `{termsCode?, minRemaining?\|minRemainingUsdg?, pledgeBps?, principal?\|principalUsdg?, loanRef?}` |
| `H081_LOAN_BORROW` | `h081_loan_borrow` | `{termsCode, budget\|budgetUsdg, dailyCap?\|dailyCapUsdg?, maxPerTx?\|maxPerTxUsdg?, days, unlockDays, agentIndex?}` |
| `H081_STAKE` | `h081_stake` | `{action: view\|stake\|request_unstake\|unstake, amount?\|h081?}` |
| `H081_PROTOCOL_INFO` | `h081_protocol_info` | `{}` |

USDG and H081 have 6 decimals: `"1000000"` = 1 token. Schemas are strict (zod); unknown keys are refused.

Mainnet ids: stipend_pool `E16DKmtrYtYGp7guSso25Pvq8gzKunnUULU28RmRmDGM`, stream_loan `8JBd7epQXxdcKRMaWM1S5PC7nsQKoZq3uCetpiJ684g4`, capacity_stake `CH1rrfFyJMVn158UHL2fLpKTtoLJojrz5f68toMQdQKU`, USDG `2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH` (Token-2022), H081 `EgqxxR7zowzaLEm24oep5qqBieLVAWYX78LhgeqAJAo`.

## The signer

The H081 SDK stages zero-knowledge proofs in program buffers over several transactions and signs each one itself, so it needs a raw `Keypair`. The plugin takes, in this order:

1. `H081_SOLANA_KEYPAIR` (a keypair JSON file) or `H081_SOLANA_KEY` (a base58 secret) from the environment: a dedicated agent key, recommended;
2. the `Keypair` inside the agent's `KeypairWallet`;
3. otherwise the action returns `{"status": "error", "message": "H081 needs a raw Keypair: ..."}`. Privy, Turnkey, Crossmint and other signer-only wallets are not supported in this version.

The agent's own `connection` is used unless `H081_RPC_URL` names another RPC. The public mainnet RPC rate-limits the history scan the first sync needs; a private RPC makes it much faster. The scanned public event log is cached under `<H081_CIRCUITS_DIR>/../cache`. Only the RPC's host is ever put in an action result or a log line (`H081_PROTOCOL_INFO` returns `rpc: "solana-mainnet.g.alchemy.com"`, never the URL), so a private RPC's API key does not reach the model provider.

Whoever holds the agent key holds the shielded balance: the account secret is an HMAC of a fixed label under the key's secret seed (`H081_ACCOUNT_SK` overrides it). No signature the key makes reveals it, so the `KeypairWallet` can keep serving other plugins' `signMessage` without exposing the bank account. Give the agent a key that holds only what it may spend.

## Loans: what `H081_LOAN_BORROW` is and is not

stream_loan has no offer book and no matching. A loan starts with a lender who opens a slot and hands the borrower an `h081-loan-terms:` code (the site makes one under Loans > Lend). `H081_LOAN_QUOTE` prices it: a 100 USDG pledge at 4000 bps backs at most 40 USDG of principal, and the protocol takes a 0.25 % origination fee out of the payout. `H081_LOAN_BORROW` grants a streaming allowance of `budget` USDG from the shielded balance to one of the agent's 16 sub-accounts, pledged to the lender's slot, makes the stream proof with the agent wallet's USDG account as the payout, and returns it as an `h081-loan-proof:` code. The agent hands that code to the lender; when the lender funds the slot, the principal minus 0.25 % arrives in the payout account. Until then nothing is borrowed.

## Environment

| Variable | Meaning |
|---|---|
| `H081_SOLANA_KEYPAIR` / `H081_SOLANA_KEY` | the agent key (file path / base58 secret); optional with a `KeypairWallet` |
| `H081_ACCOUNT_SK` | optional shielded account secret; default derived from the agent key's secret seed |
| `H081_DERIVE_ACCOUNT` | optional; `1` derives the account from the key's signature over the label instead (one such signature then equals the key; never enable it next to a message-signing tool) |
| `H081_RPC_URL` | RPC to use instead of the agent's connection; only its host is ever reported |
| `H081_RELAYER_URL` | relayer for withdrawals; default `https://h081-relayer.vercel.app`; empty = direct sends only. With a relayer set, a withdrawal that cannot go through it is refused, never sent directly instead. |
| `H081_CIRCUITS_DIR`, `H081_CIRCUITS_URL` | where the proving artifacts live / come from |
| `H081_MAX_DEPOSIT` | optional operator ceiling per deposit, base units |
| `H081_POOL_PROGRAM_ID`, `H081_LOAN_PROGRAM_ID`, `H081_CAPACITY_PROGRAM_ID`, `H081_SAFETY_PROGRAM_ID`, `H081_USDG_MINT`, `H081_STAKE_MINT`, `H081_LOAN_TREASURY`, `H081_CLUSTER` | override the mainnet ids for a rehearsal validator; a cluster/id mismatch is refused before anything is signed |

## Privacy and limits, plainly

- Deposits are public (depositor and amount); what happens inside the bank is private to the account's keys. Deposits are never relayed.
- A relayed withdrawal is sent by the relayer, so the chain does not link the agent wallet to it; a direct one is sent by the agent key. Relay fees and the loan origination fee go only to the protocol treasury `EGvxic665gsar6K3YsnuUH4qPTnv1Rb2rMu2F3GpkZGq` (USDG account `DxpmCZYAoDKpHmA5vWuopUrf3UVuGnPvditVrN9xDwDo`); on mainnet the plugin checks the relayer's advertised fee account against that address before a proof binds it and refuses any other relayer.
- The relayer fails closed: with `H081_RELAYER_URL` set, a withdrawal the relayer cannot take (unreachable, wrong terms, refusal) is not sent; the error says why, and `direct: true` is the only path to a send by the agent key.
- Above the relayer's anonymous free tier (100 USDG per 30 days today) the agent key signs the relayer's capacity message and the withdrawal counts against the wallet's H081 stake in capacity_stake (`H081_STAKE`); the relayer, not the chain, then learns which wallet it belongs to. Without enough stake it is refused before any proof; `direct: true` has no limit.
- Caps are checked locally first; a concurrent deposit can still make yours fail on chain, which costs about a second of CPU and ~0.0072 SOL of refundable rent, and is reported by name.
- Not audited yet; use at your own risk.

## Layout

`src/index.ts`, `src/actions/` and `src/tools/` are the Agent Kit plugin (actions wrap the methods with zod schemas, descriptions and examples). `src/core/` is the H081 bank facade shared with the H081 MCP server, and `src/sdk/` is the H081 Solana SDK it runs on (accounts, Poseidon/Merkle, Groth16 proving, program buffers, the relayer client). Everything is bundled into `dist/` by tsup; the only runtime dependencies are the ones in `package.json`.
