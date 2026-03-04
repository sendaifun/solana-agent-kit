import type { SolanaAgentKit } from "solana-agent-kit";
import { Transaction } from "@solana/web3.js";
import axios from "redaxios";
import { BLUEPRINT_API_BASE } from "../constants";

/**
 * Stake SOL natively with Blueprint validator (~6% APY, zero custody).
 * Returns the unsigned transaction base64 for the agent to sign and submit.
 *
 * @param agent - SolanaAgentKit instance
 * @param amountSol - Amount of SOL to stake
 * @returns Transaction signature after signing and submitting
 */
export async function blueprintStake(
  agent: SolanaAgentKit,
  amountSol: number,
): Promise<string> {
  const walletAddress = agent.wallet.publicKey.toBase58();

  const response = await axios.post(
    `${BLUEPRINT_API_BASE}/api/v1/stake/transaction`,
    {
      walletAddress,
      amountSol,
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
