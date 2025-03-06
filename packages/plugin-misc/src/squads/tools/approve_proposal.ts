import { signOrSendTX, SolanaAgentKit } from "solana-agent-kit";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Approves a proposal in a Solana multisig wallet.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {number | bigint} [transactionIndex] - The index of the transaction to approve. If not provided, the current transaction index will be used.
 * @throws {Error} - Throws an error if the approval process fails.
 */
export async function multisig_approve_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
) {
  try {
    const [multisigPda] = multisig.getMultisigPda({
      createKey: agent.wallet.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    if (!transactionIndex) {
      transactionIndex = BigInt(currentTransactionIndex);
    } else if (typeof transactionIndex !== "bigint") {
      transactionIndex = BigInt(transactionIndex);
    }

    const multisigTx = multisig.transactions.proposalApprove({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet.publicKey,
      multisigPda,
      transactionIndex: transactionIndex,
      member: agent.wallet.publicKey,
    });
    multisigTx.message.recentBlockhash = (
      await agent.connection.getLatestBlockhash()
    ).blockhash;

    return await signOrSendTX(agent, multisigTx);
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
