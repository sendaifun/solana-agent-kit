import { signOrSendTX, SolanaAgentKit } from "solana-agent-kit";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Creates a proposal for a multisig transaction.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {number | bigint} [transactionIndex] - Optional transaction index. If not provided, the current transaction index will be used.
 * @throws {Error} - Throws an error if the proposal creation fails.
 */
export async function multisig_create_proposal(
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
    const multisigTx = multisig.transactions.proposalCreate({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet.publicKey,
      multisigPda,
      transactionIndex,
      creator: agent.wallet.publicKey,
    });
    const { blockhash } = await agent.connection.getLatestBlockhash();
    multisigTx.message.recentBlockhash = blockhash;

    return await signOrSendTX(agent, multisigTx);
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
