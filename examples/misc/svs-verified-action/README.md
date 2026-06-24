# SVS Verified Action Example For Solana Agent Kit

This directory is a PR-ready example package for
`sendaifun/solana-agent-kit`. It is intentionally small so a framework
maintainer can review it without private SVS implementation details.

## What The Example Shows

The example adds one Solana Agent Kit compatible tool:

```text
svs_verify_and_submit_solana_action
```

The tool is created from the public SVS package export:

```sh
npm install @svsprotocol/solana
```

```js
import { createSvsSolanaAgentKitAdapter } from "@svsprotocol/solana/solana-agent-kit";
```

It routes a prepared Solana action through SVS so the action is not trusted
until SVS proves signed bot identity, production certification, human wallet
approval, policy enforcement, custom receipt-registry proof, and portable audit
evidence.

## Proposed Upstream Placement

Suggested destination in a Solana Agent Kit PR:

```text
examples/misc/svs-verified-action/
```

The package is safe to copy because it uses only public dependencies and
placeholder environment values.

## Local Review

From this directory:

```sh
npm install
npm run validate
```

## Run Modes

The default run is import validation only. It does not require SVS credentials,
read your config, or submit an action:

```sh
node ./svs-verified-action.mjs
```

Run `npm run validate` to check the package files and placeholder env template
before wiring the example into a live agent.

## Protocol Or Wallet Gate

Apps that consume agent output can reject unverified automation by pinning the
public SVS registry and requiring the agent to be listed before accepting the
request:

```js
import { createHostedVerifiedAgentRegistryMiddleware } from "@svsprotocol/solana/protocol";

const requireVerifiedAgent = createHostedVerifiedAgentRegistryMiddleware({
  registryUrl: "https://registry.svsprotocol.com/registry.json",
  expectedRegistryHash: "replace-with-pinned-registry-hash",
  trustPolicy: "standard"
});

await requireVerifiedAgent({
  botId: "svs-demo-devnet-agent",
  protocolId: "your-protocol-or-wallet"
});
```

If the registry hash, linked profile, trust manifest, freshness policy, or bot
listing does not verify, the middleware throws and the app should reject the
agent-submitted action.

Live submission is opt-in:

```sh
SVS_RUN_LIVE_SUBMIT=true node ./svs-verified-action.mjs
```

Live mode requires an SVS endpoint, bot API key, request-signing secret, current
integration-contract hash, and a prepared serialized transaction. Do not commit
those values.

## Public SVS References

- Docs: <https://svsprotocol.com/docs>
- Registry: <https://registry.svsprotocol.com/registry.json>
- Verified Agent Standard: <https://svsprotocol.com/docs#verified-agent-standard>
- Public verifier: <https://svsprotocol.com/verify>

## Boundary

This package must contain no API keys, request-signing secrets, local generated
evidence, private implementation source, privileged routes, or private
operational artifacts.
