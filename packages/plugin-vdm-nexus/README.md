# @solana-agent-kit/plugin-vdm-nexus

Solana Agent Kit plugin for [VDM Nexus](https://vdmnexus.com) — signed
inference via [x402](https://github.com/coinbase/x402) on Solana and Base.

Every paid `NEXUS_CHAT` call returns an OpenAI chat completion plus a
Signed Inference Receipt (SIR v2) anchored to an on-chain USDC settlement
tx. Receipts are independently verifiable with `NEXUS_VERIFY_RECEIPT`
against the operator's published Ed25519 public key.

First mainnet receipt: <https://vdmnexus.com/r/c9710ea7-9e1f-46ee-aaa9-903a536ae12e>

## Install

```bash
npm install @solana-agent-kit/plugin-vdm-nexus solana-agent-kit
```

## Usage

```ts
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { SolanaAgentKit, KeypairWallet, createVercelAITools } from "solana-agent-kit";
import VdmNexusPlugin, { configure } from "@solana-agent-kit/plugin-vdm-nexus";

const keypair = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY!));
const wallet = new KeypairWallet(keypair, process.env.SOLANA_RPC_URL!);

// Configure before .use(). signerSecretKey MUST match the wallet's
// keypair — see "Why a separate signerSecretKey?" below.
configure({
  signerSecretKey: process.env.SOLANA_PRIVATE_KEY!,
});

const agent = new SolanaAgentKit(
  wallet,
  process.env.SOLANA_RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
).use(VdmNexusPlugin);

const tools = createVercelAITools(agent, agent.actions);
// → tools now include NEXUS_CHAT, NEXUS_VERIFY_RECEIPT, NEXUS_GET_DEPOSIT_ADDRESS
```

## Actions

| Action | Purpose |
|---|---|
| `NEXUS_CHAT` | Pay-per-call signed inference. Settles a USDC payment inline via x402 and returns the OpenAI response plus a SIR v2 receipt. |
| `NEXUS_VERIFY_RECEIPT` | Run the five-check SIR v2 verifier against a receipt, prompt, and response. Confirms hashes, operator signature, on-chain settlement, and payer identity. |
| `NEXUS_GET_DEPOSIT_ADDRESS` | Discover the on-chain USDC deposit address for prepaid credit top-ups. Per-call x402 settlement does not need this — it's for agents that batch deposits. |

## Configuration

```ts
import { configure } from "@solana-agent-kit/plugin-vdm-nexus";

configure({
  // Point at a different deployment (e.g. self-hosted).
  endpoint: "https://nexus.example.com/api/v1",

  // Pin the operator pubkey for offline verification. When omitted,
  // it's fetched from `${endpoint}/operator-key`.
  operatorKey: "<base58 Ed25519 pubkey>",

  // Required for NEXUS_CHAT — see below.
  signerSecretKey: process.env.SOLANA_PRIVATE_KEY!,
});
```

### Why a separate `signerSecretKey`?

The SendAI `BaseWallet` interface intentionally hides raw secret-key
bytes — this is what lets hardware wallets and browser wallets plug into
the same interface as `KeypairWallet`. But x402 SVM settlement needs raw
Ed25519 bytes to build and sign the SPL USDC transfer carried in the
`X-Payment` header.

So the plugin asks for the secret explicitly via `configure({ signerSecretKey })`.
Pass the same base58 64-byte secret you used to construct your
`KeypairWallet`. At handler time the plugin asserts that the secret's
pubkey matches `agent.wallet.publicKey` and returns a clear
`wallet_signer_mismatch` error if they diverge — so the on-chain payment
can't accidentally land from a wallet your SendAI agent doesn't think it
owns.

Hardware-wallet support would require an upstream change in `@x402/svm`
to accept a non-keypair signer; tracked as a follow-up.

The other two actions (`NEXUS_VERIFY_RECEIPT` and
`NEXUS_GET_DEPOSIT_ADDRESS`) don't need a secret and work without
`signerSecretKey` set.

## Standalone tool helpers (optional)

For agents that mount multiple plugins but want the Nexus tools as a
standalone toolkit (e.g. to pass them to a different chain in a
multi-agent setup), import from the `/tools` sub-export:

```ts
import {
  createNexusLangchainTools,
  createNexusVercelAITools,
  getNexusActions,
} from "@solana-agent-kit/plugin-vdm-nexus/tools";

const nexusOnlyLangchainTools = await createNexusLangchainTools(agent);
const nexusOnlyVercelTools = await createNexusVercelAITools(agent);
```

These delegate to `solana-agent-kit`'s `createLangchainTools` /
`createVercelAITools` and filter to the three Nexus action names. The
adapters (`@langchain/core`, `ai`) are not direct dependencies — they're
resolved transitively from `solana-agent-kit`'s optional peers.

## What this enables

- **Audit trails.** Every inference call carries a tamper-evident
  receipt the caller can verify cryptographically. Useful for
  compliance regimes that require evidence of what a model returned
  (EU AI Act Article 12, NIST AI agent standards, OWASP LLM Top 10
  logging requirements).
- **Trustless multi-agent flows.** Agent A can hand Agent B a receipt
  and Agent B can verify it without trusting Agent A — the operator's
  Ed25519 signature + the on-chain settlement record are the trust
  anchor.
- **Pay-per-call autonomy.** No prepaid balance to babysit; the wallet
  pays inline. Top-ups via `NEXUS_GET_DEPOSIT_ADDRESS` are an
  optimization, not a prerequisite.

## Networks

| Network | CAIP-2 | Status |
|---|---|---|
| Solana mainnet | `solana:mainnet` | Live |
| Solana devnet | `solana:devnet` | Live |
| Base mainnet | `eip155:8453` | Live |
| Base Sepolia | `eip155:84532` | Live |

Pass `network: "eip155:8453"` to `NEXUS_CHAT` to settle on Base via the
same Solana-keypair-signed handshake — the Nexus facilitator handles
the chain switch server-side.

## Specification

The Signed Inference Receipt v2 wire format and verification rules are
documented at <https://docs.vdmnexus.com/docs/spec/sir-v2>.

## License

Apache-2.0 (matches the rest of Solana Agent Kit).
