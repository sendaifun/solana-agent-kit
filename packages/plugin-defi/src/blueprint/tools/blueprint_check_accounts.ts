import type { SolanaAgentKit } from "solana-agent-kit";
import axios from "redaxios";
import { BLUEPRINT_API_BASE } from "../constants";

/**
 * Check all Blueprint stake accounts for a wallet.
 * Returns stake accounts with status, balance, and epoch timing.
 *
 * @param agent - SolanaAgentKit instance
 * @returns Stake accounts data from Blueprint API
 */
export async function blueprintCheckAccounts(
  agent: SolanaAgentKit,
): Promise<Record<string, any>> {
  const walletAddress = agent.wallet.publicKey.toBase58();

  const response = await axios.get(
    `${BLUEPRINT_API_BASE}/api/v1/stake/accounts/${walletAddress}`,
  );

  return response.data;
}
