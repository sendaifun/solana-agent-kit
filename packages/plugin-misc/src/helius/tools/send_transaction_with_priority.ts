import {
  SolanaAgentKit,
  PriorityFeeResponse,
  signOrSendTX,
} from "solana-agent-kit";
import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getMint,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";

/**
 * Sends a transaction with an estimated priority fee using the provided SolanaAgentKit.
 *
 * @param agent         An instance of SolanaAgentKit containing connection, wallet, etc.
 * @param priorityLevel The priority level (e.g., "Min", "Low", "Medium", "High", "VeryHigh", or "UnsafeMax").
 * @param amount        The amount of SOL to send (in SOL, not lamports).
 * @param to            The recipient's PublicKey.
 * @returns             The transaction signature (string) once confirmed along with the fee used.
 */
export async function sendTransactionWithPriorityFee(
  agent: SolanaAgentKit,
  priorityLevel: string,
  amount: number,
  to: PublicKey,
  splmintAddress?: PublicKey,
): Promise<{ transactionId: string; fee: number }> {
  try {
    if (!splmintAddress) {
      const transaction = new Transaction();
      const { blockhash, lastValidBlockHeight } =
        await agent.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = agent.wallet.publicKey;

      const transferIx = SystemProgram.transfer({
        fromPubkey: agent.wallet.publicKey,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      transaction.add(transferIx);
      const signedTx = await agent.wallet.signTransaction(transaction);

      const response = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${agent.config.HELIUS_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getPriorityFeeEstimate",
            params: [
              {
                transaction: bs58.encode(signedTx.serialize()),
                options: { priorityLevel: priorityLevel },
              },
            ],
          } as PriorityFeeResponse),
        },
      );

      const data = await response.json();
      if (data.error) {
        throw new Error("Error fetching priority fee:");
      }
      const feeEstimate: number = data.result.priorityFeeEstimate;

      // Set the priority fee if applicable
      const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: feeEstimate,
      });
      transaction.add(computePriceIx);

      if (agent.config.signOnly) {
        throw new Error("Sign only mode is enabled. Transaction not sent.");
      }

      const txSignature = await agent.wallet.sendTransaction(transaction);

      return {
        transactionId: txSignature,
        fee: feeEstimate,
      };
    } else {
      const fromAta = await getAssociatedTokenAddress(
        splmintAddress,
        agent.wallet.publicKey,
      );
      const toAta = await getAssociatedTokenAddress(splmintAddress, to);

      const mintInfo = await getMint(agent.connection, splmintAddress);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      const transaction = new Transaction();
      const { blockhash, lastValidBlockHeight } =
        await agent.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = agent.wallet.publicKey;

      const response = await fetch(
        `https://mainnet.helius-rpc.com/?api-key=${agent.config.HELIUS_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getPriorityFeeEstimate",
            params: [
              {
                transaction: bs58.encode(transaction.serialize()),
                options: { priorityLevel: priorityLevel },
              },
            ],
          } as PriorityFeeResponse),
        },
      );

      const data = await response.json();
      if (data.error) {
        throw new Error("Error fetching priority fee:");
      }
      const feeEstimate: number = data.result.priorityFeeEstimate;

      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: feeEstimate,
        }),
      );

      transaction.add(
        createAssociatedTokenAccountInstruction(
          agent.wallet.publicKey,
          toAta,
          to,
          splmintAddress,
        ),
      );

      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet.publicKey,
          adjustedAmount,
        ),
      );

      if (agent.config.signOnly) {
        throw new Error("Sign only mode is enabled. Transaction not sent.");
      }

      const txSignature = await agent.wallet.sendTransaction(transaction);

      return {
        transactionId: txSignature,
        fee: feeEstimate,
      };
    }
  } catch (error: any) {
    throw new Error(`Failed to process transaction: ${error.message}`);
  }
}
