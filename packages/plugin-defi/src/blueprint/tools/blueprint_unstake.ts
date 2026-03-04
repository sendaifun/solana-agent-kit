import type { SolanaAgentKit } from "solana-agent-kit";
import { Transaction } from "@solana/web3.js";
import axios from "redaxios";
import { BLUEPRINT_API_BASE } from "../constants";

/**
 * Unstake (deactivate) SOL from Blueprint validator.
 * After deactivation, SOL can be withdrawn after the cooldown epoch.
 *
 * @param agent - SolanaAgentKit instance
 * @param stakeAccountAddress - The stake account to deactivate
 * @returns Transaction signature after signing and submitting
 */
export async function blueprintUnstake(
  agent: SolanaAgentKit,
  stakeAccountAddress: string,
): Promise<string> {
  const walletAddress = agent.wallet.publicKey.toBase58();

  const response = await axios.post(
    `${BLUEPRINT_API_BASE}/api/v1/unstake/transaction`,
    {
      walletAddress,
      stakeAccountAddress,
    },
  );

  const { transaction } = response.data;
  const tx = Transaction.from(Buffer.from(transaction, "base64"));
  tx.sign(agent.wallet);

  const signature = await agent.connection.sendRawTransaction(
    tx.serialize(),
  );

  return signature;
}
