# Bounty Radar — SendAI Solana Agent Kit v2 Plugin

Integration between [Bounty Radar](https://github.com/fliptrigga13/bounty-radar)
(A2A v0.3 opportunity-discovery service for Superteam Earn) and
[SendAI Solana Agent Kit v2](https://github.com/sendaifun/solana-agent-kit).

## Data flow

```
Superteam Earn (live listings)
        ↓
Bounty Radar (poll + AGENT_ALLOWED filter + dedup + enrichment)
        ↓  A2A v0.3 JSON-RPC: message/send "/feed"
Solana Agent Kit agent  ← BOUNTY_RADAR_FEED action returns structured opportunities
        ↓
capability / policy evaluation by the host agent
        ↓
existing agent tools (analysis, planning, reporting — NOT auto-execution)
```

**Safety boundary:** this plugin is discovery/evaluation only. It never claims,
executes, signs, spends, or submits bounties. All listing content is treated as
untrusted external data.

## Setup

```bash
export BOUNTY_RADAR_URL="https://your-radar.example.com"   # or http://localhost:8080
```

Both base URL and direct A2A endpoint forms are accepted:
- `https://radar.example.com`
- `https://radar.example.com/a2a`

## Usage

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import MiscPlugin, {
  configureBountyRadar,
} from "@solana-agent-kit/plugin-misc";

configureBountyRadar("https://your-radar.example.com"); // optional if env/config is set
const agent = new SolanaAgentKit(wallet, rpcUrl, config).use(MiscPlugin);

// via AI action (BOUNTY_RADAR_FEED):
// "find agent bounties" / "check bounty radar" / "find agent-eligible opportunities"

// programmatically:
const opportunities = await agent.methods.fetchBountyRadarFeed(
  "https://your-radar.example.com",
);
```

> **Multi-tenant note:** `configureBountyRadar()` sets a process-wide fallback.
> Prefer `config.BOUNTY_RADAR_URL` when agents in one process use different endpoints.

Each returned opportunity follows the Bounty Radar Opportunity Contract:

```json
{
  "source": "superteam-earn",
  "id": "e92e317b-…",
  "title": "ZNS Solana Creator Challenge",
  "reward": "500 USDC",
  "deadline": "2026-09-09",
  "url": "https://earn.superteam.fun/listing/zns-sol",
  "agent_access": "AGENT_ALLOWED",
  "observed_at": "2026-08-24T14:50:09Z",
  "provenance": "superteam.fun/api/listings?type=bounty&filter=agents",
  "skills": [{"skills": "Frontend", "subskills": ["React"]}],
  "eligibility": [{"type": "text", "question": "…", "optional": false}],
  "region": "Global",
  "requirements": null,
  "description_text": "…"
}
```

Only listings with explicit `"agent_access": "AGENT_ALLOWED"` are surfaced.

## Tests

```bash
cd packages/plugin-misc
pnpm exec jest --config jest.config.cjs __tests__/bountyradar.test.ts
```

13 offline tests cover: URL normalization, JSON-RPC framing, Message/Task/artifact
response parsing, DataPart extraction, JSON-in-TextPart extraction,
AGENT_ALLOWED filtering, dedupe, malformed responses, HTTP/JSON-RPC errors,
missing config, and prompt-injection inertness.
