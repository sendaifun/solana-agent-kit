import { SolanaAgentKit } from "solana-agent-kit";

export interface SpendIntent {
  destination: string;
  amountUsd: number;
  epochId?: string;
}

export async function rampartSpend(
  agent: SolanaAgentKit,
  intent: SpendIntent,
): Promise<any> {
  // Gate-and-release only: the agent never holds the vault key. Policy is enforced
  // on-chain by the Rampart program. This client just builds the intent and surfaces
  // the refusal when policy says no.
  const programId = "6Ea4SqpMwVE57cghBU4LqhZBSs573cQ8o8FXDitKUHEr";
  const mockOracle = "2xbNzbkEZ65hLzi9TgdMBcncup6a5CA1qi3QLVTrwQ2p";
  return {
    programId,
    mockOracle,
    intent,
    status: "interface_only",
    note:
      "Interface-only: builds the intent shape but does not submit on-chain. Real enforcement happens via the Rampart program (see PR #636 for verified refusal signature). Devnet only.",
  };
}
