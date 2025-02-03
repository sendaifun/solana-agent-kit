import { SolanaAgentKit } from "../../index";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Creates a proposal for a multisig transaction.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {number | bigint} [transactionIndex] - Optional transaction index. If not provided, the current transaction index will be used.
 * @returns {Promise<string>} - The transaction ID of the created proposal.
 * @throws {Error} - Throws an error if the proposal creation fails.
 */
export async function multisig_create_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
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
      feePayer: agent.wallet_address,
      multisigPda,
      transactionIndex,
      creator: agent.wallet_address,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
