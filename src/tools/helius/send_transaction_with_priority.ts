import { SolanaAgentKit, PriorityFeeResponse } from "../../index";
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
      transaction.feePayer = agent.wallet_address;

      const transferIx = SystemProgram.transfer({
        fromPubkey: agent.wallet_address,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      transaction.add(transferIx);
      transaction.sign(agent.wallet);

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

      // Set the priority fee if applicable
      const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: feeEstimate,
      });
      transaction.add(computePriceIx);

      // Send the transaction and confirm
      const txSignature = await sendAndConfirmTransaction(
        agent.connection,
        transaction,
        [agent.wallet],
      );

      return {
        transactionId: txSignature,
        fee: feeEstimate,
      };
    } else {
      const fromAta = await getAssociatedTokenAddress(
        splmintAddress,
        agent.wallet_address,
      );
      const toAta = await getAssociatedTokenAddress(splmintAddress, to);

      const mintInfo = await getMint(agent.connection, splmintAddress);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      const transaction = new Transaction();
      const { blockhash, lastValidBlockHeight } =
        await agent.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = agent.wallet_address;

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
          agent.wallet_address,
          toAta,
          to,
          splmintAddress,
        ),
      );

      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet_address,
          adjustedAmount,
        ),
      );

      const txSignature = await sendAndConfirmTransaction(
        agent.connection,
        transaction,
        [agent.wallet],
      );

      return {
        transactionId: txSignature,
        fee: feeEstimate,
      };
    }
  } catch (error: any) {
    throw new Error(`Failed to process transaction: ${error.message}`);
  }
}
