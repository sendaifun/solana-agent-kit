import { SolanaAgentKit } from "../index";
import { VersionedTransaction,Keypair } from "@solana/web3.js";

/**
 * Create a task on Gibwork using their public transaction API
 * @param agent SolanaAgentKit instance
 * @param title Task title
 * @param content Task description content
 * @param requirements Task requirements
 * @param tags Array of tags for the task
 * @param payer Payer address
 * @param tokenMintAddress Token mint address for payment
 * @param tokenAmount Payment amount
 * @returns Response containing the task creation transaction and the taskId
 */
export async function create_gibwork_task(
    agent: SolanaAgentKit,
    title: string,
    content: string,
    requirements: string,
    tags: string[],
    tokenMintAddress: string,
    tokenAmount: number,
    payer?: string,
) {
    try {
        const response = await fetch('https://api2.gib.work/tasks/public/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                requirements,
                tags,
                payer: payer || agent.wallet.publicKey.toBase58(),
                token: {
                    mintAddress: tokenMintAddress,
                    amount: tokenAmount
                }
            })
        });

        const data = await response.json();
        const serializedTx = data.serializedTransaction;
        const txn = VersionedTransaction.deserialize(Buffer.from(serializedTx, "base64"));
        const signature = await signAndSendTransaction(agent, txn, agent.wallet)

        return {
            success: true,
            taskId: data.taskId,
            signature: signature
        };
    } catch (error: any) {
        throw new Error(`Error creating Gibwork task: ${error.message}`);
    }
}

async function signAndSendTransaction(
    kit: SolanaAgentKit,
    tx: VersionedTransaction,
    mintKeypair: Keypair,
  ) {
    try {
      const { blockhash, lastValidBlockHeight } =
        await kit.connection.getLatestBlockhash();
  
      tx.message.recentBlockhash = blockhash;
  
      tx.sign([mintKeypair, kit.wallet]);
  
      const signature = await kit.connection.sendTransaction(tx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      });
  
      const confirmation = await kit.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
  
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
  
      return signature;
    } catch (error) {
      console.error("Transaction send error:", error);
      if (error instanceof Error && "logs" in error) {
        console.error("Transaction logs:", error.logs);
      }
      throw error;
    }
  }