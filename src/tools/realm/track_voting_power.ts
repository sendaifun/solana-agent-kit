import { PublicKey } from "@solana/web3.js";
import { getTokenOwnerRecord } from "@solana/spl-governance";
import { SolanaAgentKit } from "../../agent";

/**
 * Tracks the voting power of a user in a governance realm.
 *
 * @param agent - SolanaAgentKit instance.
 * @param tokenOwnerRecordPk - PublicKey of the user's Token Owner Record.
 * @returns The voting power of the user.
 */
export async function trackVotingPower(
  agent: SolanaAgentKit,
  tokenOwnerRecordPk: PublicKey,
): Promise<number> {
  // Fetch the Token Owner Record
  const tokenOwnerRecord = await getTokenOwnerRecord(
    agent.connection,
    tokenOwnerRecordPk,
  );

  if (!tokenOwnerRecord) {
    throw new Error("Token Owner Record not found.");
  }

  // Return the voting power (governing token deposit amount)
  return tokenOwnerRecord.account.governingTokenDepositAmount.toNumber();
}
