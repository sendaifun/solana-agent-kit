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
    sdkInstance: SolanaAgentKit,
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
                payer: fundingAccount || sdkInstance.wallet.publicKey.toBase58(),
                token: {
                    mintAddress: paymentMint,
                    amount: paymentAmount
                }
            })
        });

        const responseData = await apiResponse.json();

        return {
            success: true,
            taskId: responseData.taskId,
            serializedTransaction: responseData.serializedTransaction
        };
    } catch (err: any) {
        throw new Error(`Failed to create a Gibwork job: ${err.message}`);
    }
}
