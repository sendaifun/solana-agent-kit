import {
  PublicKey,
  Transaction,
  Signer,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getGovernanceProgramVersion,
  withSetGovernanceDelegate,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Set a governance delegate for a given realm and token owner.
 *
 * @param agent                    The SolanaAgentKit instance.
 * @param realmId                  The public key of the realm as a string.
 * @param governingTokenMintId     The public key of the governing token mint as a string.
 * @param governingTokenOwnerId    The public key of the governing token owner as a string.
 * @param newDelegateId            The public key of the new delegate as a string.
 * @returns                        The transaction signature.
 */
export async function manageVoteDelegation(
  agent: SolanaAgentKit,
  realmId: string,
  governingTokenMintId: string,
  governingTokenOwnerId: string,
  newDelegateId: string,
): Promise<string> {
  const realmPublicKey = new PublicKey(realmId);
  const governingTokenMint = new PublicKey(governingTokenMintId);
  const governingTokenOwner = new PublicKey(governingTokenOwnerId);
  const newDelegate = new PublicKey(newDelegateId);
  const governanceProgramId = new PublicKey(
    "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
  );

  try {
    const connection = agent.connection;
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );

    const transaction = new Transaction();
    const instructions: TransactionInstruction[] = [];

    await withSetGovernanceDelegate(
      instructions,
      governanceProgramId,
      programVersion,
      realmPublicKey,
      governingTokenMint,
      governingTokenOwner,
      agent.wallet.publicKey,
      newDelegate,
    );

    transaction.add(...instructions);

    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [agent.wallet as Signer],
      {
        preflightCommitment: "confirmed",
      },
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to set governance delegate: ${error.message}`);
  }
}
