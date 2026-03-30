# @solana-agent-kit/plugin-agentpass

Identity & credential verification plugin for [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit).

Allows agents to verify other agents' identities and check verifiable credentials using [AgentPass](https://agentpass.space) — an open-source identity layer for AI agents.

## Installation

```bash
npm install @solana-agent-kit/plugin-agentpass
```

## Usage

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import AgentPassPlugin from "@solana-agent-kit/plugin-agentpass";

const agent = new SolanaAgentKit(privateKey, rpcUrl, {});
agent.use(AgentPassPlugin);

// Verify an agent's identity
const result = await agent.methods.verify_agent({
  passport_id: "ap_a622a643aa71",
});
// → { verified: true, name: "Kai", onchain_bound: true }

// Check credentials
const creds = await agent.methods.check_credential({
  passport_id: "ap_a622a643aa71",
  credential_type: "capability",
});
// → { has_credential: true, credentials: [...] }
```

## Actions

### VERIFY_AGENT_IDENTITY
Verify an AI agent's identity via AgentPass API + on-chain Solana binding.

**Triggers:** "verify agent", "check agent identity", "is this agent real"

### CHECK_AGENT_CREDENTIAL
Check if an agent has specific verifiable credentials (MVA format).

**Triggers:** "check credential", "verify credential", "agent capabilities"

## How it works

1. **Off-chain**: Queries AgentPass API for passport data and credentials
2. **On-chain**: Checks Solana program for wallet-passport binding and credential anchors
3. **Combined**: Returns unified verification result

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENTPASS_API_URL` | `https://api.agentpass.space` | AgentPass API endpoint |

## Links

- [AgentPass](https://agentpass.space) — Identity layer for AI agents
- [MVA Credential](https://github.com/kai-agent-free/mva-credential) — Verifiable credential standard
- [On-chain program](https://github.com/kai-agent-free/agentpass-solana) — Solana credential anchor
