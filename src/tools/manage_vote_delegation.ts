import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { withSetGovernanceDelegate } from "@solana/spl-governance";

/**
 * Delegates voting power to another user.
 *
 * @param programId - PublicKey of the governance program.
 * @param programVersion - Version of the governance program.
 * @param realm - PublicKey of the governance realm.
 * @param governingTokenMint - PublicKey of the governing token mint (e.g., community or council mint).
 * @param governingTokenOwner - PublicKey of the current token owner.
 * @param governanceAuthority - PublicKey of the user's wallet (governance authority).
 * @param newGovernanceDelegate - PublicKey of the user to whom voting power is being delegated.
 * @returns A prepared Transaction object.
 */
export async function manageVoteDelegation(
  programId: PublicKey,
  programVersion: number,
  realm: PublicKey,
  governingTokenMint: PublicKey,
  governingTokenOwner: PublicKey,
  governanceAuthority: PublicKey,
  newGovernanceDelegate: PublicKey,
): Promise<Transaction> {
  const transaction = new Transaction();

  // Add the set governance delegate instruction
  await withSetGovernanceDelegate(
    transaction.instructions, // Array to add the instruction
    programId, // Governance program ID
    programVersion, // Program version
    realm, // Governance realm public key
    governingTokenMint, // Mint address (community or council)
    governingTokenOwner, // Token owner's public key
    governanceAuthority, // Current authority's public key
    newGovernanceDelegate, // Delegatee's public key
  );

  return transaction;
}
