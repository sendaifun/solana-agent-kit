# Select Infrastructure — Solana Agent Kit Integration

> Ref: solana-agent-kit Issue #624

## Overview

Two actions that let any Solana Agent Kit agent consume Select Infrastructure's on-chain security services before interacting with programs or tokens.

## Actions

### `SELECT_AUDIT_ANCHOR` (25 USDC)

Audits a Solana Anchor repository for security vulnerabilities before the agent calls it.

**Checks:** `init_if_needed`, `remaining_accounts`, `unsafe` blocks, `.unwrap()`, missing signer constraints, CI/CD coverage.

```typescript
import { selectAuditAction } from "./selectAuditAction";

const result = await selectAuditAction.handler(agent, { repo: "coral-xyz/anchor" });
// result.sessionId → pay via Solana Pay → receive SHA-256 verified dossier
```

### `SELECT_TOKEN_SCAN` (5 USDC)

Forensic risk scan on any SPL token before a swap or position.

**Checks:** RugCheck score, Mint Authority, Freeze Authority, holder concentration, liquidity depth.

```typescript
import { selectTokenScanAction } from "./selectTokenScanAction";

const result = await selectTokenScanAction.handler(agent, {
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
});
// result.sessionId → pay 5 USDC → receive token forensic dossier
```

## On-Chain Settlement

All payments settle through the Select v2 Escrow on Solana Mainnet:

| Field | Value |
|-------|-------|
| Program ID | `E3XAx7qEKHte9kmWKhuyAVxb8CgE2g4k5FqkrRx2kdsF` |
| Instruction | `create_task_v2` (PayerApproval) |
| Routing Domain | `payments_v2` |
| USDC Mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Settlement | 98% Provider / 2% Protocol Fee |
| Verification | SHA-256 hash of delivered artifact |

## Architecture

```
Agent → selectAuditAction → POST /api/audit → H2M Gateway
                                                  ↓
                              Phantom Wallet → create_task_v2 (Escrow)
                                                  ↓
                              On-chain funding confirmed → Generate dossier
                                                  ↓
                              SHA-256 verified .md delivered to agent
```

## Integration with Solana Agent Kit

Register the actions in your agent configuration:

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import { selectAuditAction } from "@selectinfra/sendai/selectAuditAction";
import { selectTokenScanAction } from "@selectinfra/sendai/selectTokenScanAction";

const agent = new SolanaAgentKit(/* config */);
agent.registerAction(selectAuditAction);
agent.registerAction(selectTokenScanAction);
```

## Gateway

- **Production:** https://api.tryaigility.com
- **Audit endpoint:** `POST /api/audit` `{"repo":"owner/repo"}`
- **Token scan endpoint:** `POST /api/token-scan` `{"mint":"<address>"}`
- **Config:** `GET /api/config`

## License

MIT
