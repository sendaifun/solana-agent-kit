import type { SolanaAgentKit } from "solana-agent-kit";
import { Transaction } from "@solana/web3.js";
import axios from "redaxios";
import { BLUEPRINT_API_BASE } from "../constants";

/**
 * Donate SOL to Blueprint to support development of the agentic staking platform.
 * Zero custody — transaction is signed locally.
 *
 * @param agent - SolanaAgentKit instance
 * @param amountSol - Amount of SOL to donate
 * @returns Transaction signature after signing and submitting
 */
export async function blueprintDonate(
  agent: SolanaAgentKit,
  amountSol: number,
): Promise<string> {
  const walletAddress = agent.wallet.publicKey.toBase58();

  const response = await axios.post(
    `${BLUEPRINT_API_BASE}/api/v1/donate`,
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
