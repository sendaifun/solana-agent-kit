<div align="center">

# Coldstar Agent Starter

Solana Agent Kit with a wallet the agent **cannot drain**: every transaction passes a local policy before a signature exists, and the root key is never in the agent's process.

</div>

## What this shows

Most agent examples start with `Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY))`. That works, and it means one prompt injection, leaked log, or bad dependency is the whole wallet.

[Coldstar](https://coldstar.dev/agent-signing) splits the job. An air-gapped **root** key signs a policy once. The agent holds a disposable **session** key bounded by that policy. `ColdstarWallet` implements Solana Agent Kit's `BaseWallet`, so it drops in where `KeypairWallet` would, and decides one of three things for every `signTransaction` call:

| Decision | What happens |
|---|---|
| `AUTO_SIGN` | In policy. The session key signs. |
| `ESCALATE` | Over a threshold or to an unknown recipient. The unsigned transaction goes to a human on the air-gapped device (QR). No signature here. |
| `REJECT` | Blocklisted recipient. **No signature is ever produced.** |

The policy is a short, ordered rule list evaluated locally, first match wins: blocklist → program allowlist → escalate threshold → per-transaction limit → recipient allowlist → daily cap → auto-sign.

## Run it (devnet)

```bash
cp .env.example .env
npm install
npm run sign-policy # the ROOT signs the policy for the session key -> envelope.json (demo root generated locally)
npm run demo        # airdrops to a throwaway session key, then runs the three scenarios
npm run demo:dry    # verdicts only; no funds needed
```

`sign-policy` is the cold side. In production it runs on the air-gapped Coldstar device; here a demo root keypair is generated into `.root.json` so you can see the whole flow. The online side then refuses to start unless `envelope.json` verifies against that root and names the session key it holds. Skip the step and the demo runs on the bare, unsigned policy and says so.

Expected output, abbreviated:

```
── 1. AUTO_SIGN — 0.01 SOL to an allowlisted recipient
  [policy] AUTO_SIGN 0.01 SOL     within policy
  -> signed by the session key and broadcast: https://explorer.solana.com/tx/...?cluster=devnet

── 2. ESCALATE — 0.5 SOL, above the escalate threshold
  [policy] ESCALATE  0.5 SOL      amount 0.5 SOL exceeds escalate threshold 0.05
  Unsigned transaction for the air-gapped device (scan with Coldstar):
  ▄▄▄▄▄▄▄ ...
  -> ColdstarEscalation: waiting for a human on the air-gapped side

── 3. REJECT — 0.001 SOL to a blocklisted recipient (the injected-agent case)
  [policy] REJECT    0.001 SOL    recipient ... is blocklisted
  -> ColdstarRejected: recipient ... is blocklisted
  -> no signature was produced. This is the compromised-agent guardrail.
```

With an OpenAI key, `npm run chat` puts an LLM in front of the same wallet. Ask it to send everything to the blocked address and watch the tool call fail closed.

## The integration, in full

```ts
import { SolanaAgentKit } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { ColdstarWallet } from "coldstar-agent-signer";

const wallet = new ColdstarWallet({
  policy,                 // coldstar.policy.json
  session,                // a Keypair the cold root authorised; disposable
  rpcUrl: RPC_URL,
  onEscalate: async (tx, reason) => null,   // hand `tx` to the air-gapped device; return it signed, or null
  onDecision: (v) => console.log(v.decision, v.reason),
});

const agent = new SolanaAgentKit(wallet, RPC_URL, {}).use(TokenPlugin);
```

Nothing above the wallet changes. Every plugin and framework adapter keeps working; the wallet just says no sometimes.

## Files

| File | Purpose |
|---|---|
| `coldstar.policy.json` | The policy. `$ALLOWED_RECIPIENT` and `$BLOCKED_RECIPIENT` are filled from `.env` (or generated per run). Allowlists the System and ComputeBudget programs; the kit prepends ComputeBudget (priority fee) instructions to every transfer, and a policy that omits it escalates everything. |
| `src/cold.ts` | The cold side: root signs the policy for the session key (`npm run sign-policy`). |
| `src/wallet.ts` | Builds the `ColdstarWallet` from the root-signed envelope (or the bare policy), with the QR escalation handler and a persistent ledger. |
| `src/demo.ts` | The three scenarios. |
| `src/chat.ts` | Optional LLM REPL via `createVercelAITools`. |

## Honest notes

- **Devnet only.** `src/wallet.ts` refuses a mainnet RPC. Coldstar is beta software; an independent audit is planned before its production release.
- **Allowlisted programs are trusted.** A swap through an allowlisted program cannot be statically decoded to a SOL amount, so this release trusts the program allowlist for non-System programs. Keep `allowPrograms` short. Details in the [agent-signer README](https://github.com/ExpertVagabond/coldstar-agent-signer#posture-on-non-system-programs-read-this).
- **The escalation handler here declines.** In a real deployment it returns the transaction after a human approves it on the offline device; the demo prints the QR and returns `null` so you can see the `ColdstarEscalation` path.
- `signMessage` is disabled unless you opt in, because off-chain signatures can authorise things the transaction policy never sees.
- **Why `signOnly: true`.** The kit's default send path (`signOrSendTX` → `sendTx`) signs a transaction, discards it, then builds and signs a second one with a fresh blockhash. Both signatures are real, so a policy wallet correctly counts the transfer twice against the daily cap. With `signOnly` the kit signs once and returns the transaction; the demo broadcasts it. If you use the default path with a policy wallet, size `dailySol` accordingly.

## Links

- Package: [github.com/ExpertVagabond/coldstar-agent-signer](https://github.com/ExpertVagabond/coldstar-agent-signer)
- Why this design: [coldstar.dev/agents](https://coldstar.dev/agents)
- How it compares to hosted signers: [coldstar.dev/compare/solana-agent-wallets-compared](https://coldstar.dev/compare/solana-agent-wallets-compared)
