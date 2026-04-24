# AlgoVoi provider for `@solana-agent-kit/plugin-blinks`

[AlgoVoi](https://api1.ilovechicken.co.uk/.well-known/agent.json) is a
multi-chain payment facilitator (x402 / MPP / AP2) with a native
Solana Actions + Blinks surface. Every hosted AlgoVoi checkout on
Solana is exposed at `GET/POST /actions/checkout/{token}` and returns
an SPL USDC transfer that includes a **Solana Pay `reference` pubkey**
as a non-signer account — letting the AlgoVoi facilitator
deterministically bind the on-chain settlement to the specific
merchant mandate, without memo dependency or amount-uniqueness
gymnastics.

This provider lets a `SolanaAgentKit` agent pay any AlgoVoi checkout
with one call.

## Methods

- `algovoi_get_checkout(agent, tokenOrUrl, baseUrl?)` — fetch Action
  metadata (amount, title, disabled state) without signing. Use this
  to preview the payment with the user before signing.
- `algovoi_pay_checkout(agent, tokenOrUrl, baseUrl?)` — POST to the
  Action endpoint, deserialize the returned unsigned
  VersionedTransaction, sign, broadcast. Returns the signature (or a
  signed tx if the agent is configured `signOnly`).

Both accept:

- a bare checkout token (`xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx`)
- a hosted checkout URL (`https://api1.ilovechicken.co.uk/checkout/...`)
- a `solana-action:` scheme URL as pasted from Dialect / Phantom /
  Solflare / Backpack

Default `baseUrl` is the public AlgoVoi gateway; override to hit a
self-hosted AlgoVoi instance.

## Actions (natural-language)

- `ALGOVOI_PAY_CHECKOUT` — "pay algovoi checkout <token>"
- `ALGOVOI_GET_CHECKOUT` — "inspect algovoi checkout <token>"

## Example

```ts
import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import BlinksPlugin from "@solana-agent-kit/plugin-blinks";

const agent = new SolanaAgentKit(
  new KeypairWallet(myKeypair),
  "https://api.mainnet-beta.solana.com",
  {},
).use(BlinksPlugin);

// Preview first
const preview = await agent.methods.algovoi_get_checkout(
  agent,
  "xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx",
);
console.log(preview.label);   // "Pay 0.5 USDC"

// Then pay
const sig = await agent.methods.algovoi_pay_checkout(
  agent,
  "xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx",
);
console.log("Settled:", sig);
```

## Reference

- AlgoVoi Solana Pay reference binding:
  <https://github.com/chopmob-cloud/AlgoVoi-Platform-Adapters>
- Solana Actions spec:
  <https://solana.com/developers/guides/advanced/actions>
