import { PublicKey } from "@solana/web3.js";
import {
  getTokenOwnerRecordAddress,
  getTokenOwnerRecord,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Track the voting power of a specific wallet address in a realm on Solana.
 *
 * @param agent       The SolanaAgentKit instance.
 * @param realmId     The public key of the realm as a string.
 * @param walletId    The public key of the wallet as a string.
 * @param governingTokenMint The public key of the governing token mint.
 * @returns           The voting power of the specified wallet in the realm.
 */
export async function trackVotingPower(
  agent: SolanaAgentKit,
  realmId: string,
  walletId: string,
  governingTokenMint: string,
): Promise<number> {
  const realmPublicKey = new PublicKey(realmId);
  const walletPublicKey = new PublicKey(walletId);
  const governingTokenMintKey = new PublicKey(governingTokenMint);
  const governanceProgramId = new PublicKey(
    "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
  );

  try {
    // Get the TokenOwnerRecord address
    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realmPublicKey,
      governingTokenMintKey,
      walletPublicKey,
    );

    // Fetch the TokenOwnerRecord
    const tokenOwnerRecord = await getTokenOwnerRecord(
      agent.connection,
      tokenOwnerRecordAddress,
    );

    // Return the voting power
    return tokenOwnerRecord.account.governingTokenDepositAmount.toNumber();
  } catch (error: any) {
    throw new Error(`Unable to track voting power: ${error.message}`);
  }
}
