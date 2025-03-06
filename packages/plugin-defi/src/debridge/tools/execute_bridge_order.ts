import { signOrSendTX, SolanaAgentKit } from "solana-agent-kit";
import { VersionedTransaction } from "@solana/web3.js";

/**
 * Execute a bridge transaction on Solana.
 * @param agent SolanaAgentKit instance
 * @param transactionData Hex-encoded transaction data
 * @returns Transaction signature
 */
export async function executeDebridgeBridgeOrder(
  agent: SolanaAgentKit,
  transactionData: string,
) {
  // Convert transaction data to buffer
  const txBuffer = Buffer.from(transactionData.substring(2), "hex");

  // Deserialize transaction
  const transaction = VersionedTransaction.deserialize(txBuffer);

  if (!transaction.message.staticAccountKeys?.length) {
    throw new Error(
      "Invalid transaction: No account keys found in the transaction",
    );
  }

  // Get a fresh blockhash and update transaction
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;

  // Sign transaction with agent's wallet
  return await signOrSendTX(agent, transaction);
}
