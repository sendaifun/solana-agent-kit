import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Submit a job to Gibwork using their transaction API
 * @param sdkInstance Instance of SolanaAgentKit
 * @param jobTitle Title of the job
 * @param jobDetails Description or details about the job
 * @param jobCriteria Criteria or requirements for the job
 * @param jobTags List of tags associated with the job
 * @param fundingAccount Address of the payer's wallet
 * @param paymentMint Token mint address used for payment
 * @param paymentAmount Amount of tokens to be paid
 * @returns Response containing the transaction for job creation and the generated jobId
 */
export async function submitGibworkTask(
    agent: SolanaAgentKit,
    jobTitle: string,
    jobDetails: string,
    jobCriteria: string,
    jobTags: string[],
    paymentMint: string,
    paymentAmount: number,
    fundingAccount?: string,
) {
    try {
        const apiResponse = await fetch('https://api2.gib.work/tasks/public/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: jobTitle,
                content: jobDetails,
                requirements: jobCriteria,
                tags: jobTags,
                payer: fundingAccount || agent.wallet.publicKey.toBase58(),
                token: {
                    mintAddress: paymentMint,
                    amount: paymentAmount
                }
            })
        });

        const responseData = await apiResponse.json();
        const txn = VersionedTransaction.deserialize(
            Buffer.from(responseData.serializedTransaction, "base64"),
        );
        const { blockhash } = await agent.connection.getLatestBlockhash();
        txn.message.recentBlockhash = blockhash;
    
        txn.sign([agent.wallet]);
        const signature = await agent.connection.sendTransaction(txn, {
          preflightCommitment: "confirmed",
          maxRetries: 3,
        });

        const latestBlockhash = await agent.connection.getLatestBlockhash();
        await agent.connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        return {
            success: true,
            taskId: responseData.taskId,
            signature: signature
        };
    } catch (err: any) {
        throw new Error(`Failed to create a Gibwork job: ${err.message}`);
    }
}
