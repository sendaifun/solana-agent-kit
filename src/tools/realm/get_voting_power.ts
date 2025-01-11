import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import { getTokenOwnerRecordsByOwner } from "@solana/spl-governance";

/**
 * Get current voting power for a wallet in a realm including delegated power
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param realm {PublicKey} The public key of the realm
 * @param governingTokenMint {PublicKey} The mint of the governing token to check power for
 *
 * @returns {Promise<Object>} Object containing voting power details:
 * - votingPower: Direct voting power from token deposits
 * - delegatedPower: Additional voting power from delegations
 * - totalVotesCount: Total number of votes cast
 * - unrelinquishedVotesCount: Number of active votes
 * - outstandingProposalCount: Number of outstanding proposals
 *
 * @throws {Error} If public keys are invalid
 * @throws {Error} If fetching voting power fails
 *
 * @example
 * const votingPower = await getVotingPower(
 *   agent,
 *   new PublicKey("realm-address"),
 *   new PublicKey("token-mint-address")
 * );
 */
export async function getVotingPower(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
): Promise<{
  votingPower: number;
  delegatedPower: number;
  totalVotesCount: number;
  unrelinquishedVotesCount: number;
  outstandingProposalCount: number;
}> {
  // Validate public keys
  if (
    !PublicKey.isOnCurve(realm.toBytes()) ||
    !PublicKey.isOnCurve(governingTokenMint.toBytes())
  ) {
    throw new Error("Invalid realm or governingTokenMint address");
  }

  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(
      "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    );

    // Get all token owner records for this wallet
    const tokenOwnerRecords = await getTokenOwnerRecordsByOwner(
      connection,
      governanceProgramId,
      agent.wallet_address,
    );

    // Find the record for the specific token mint we're interested in
    const relevantRecord = tokenOwnerRecords.find((record) =>
      record.account.governingTokenMint.equals(governingTokenMint),
    );

    if (!relevantRecord) {
      return {
        votingPower: 0,
        delegatedPower: 0,
        totalVotesCount: 0,
        unrelinquishedVotesCount: 0,
        outstandingProposalCount: 0,
      };
    }

    return {
      votingPower:
        relevantRecord.account.governingTokenDepositAmount.toNumber(),
      // Calculate delegated power based on presence of governance delegate
      delegatedPower: relevantRecord.account.governanceDelegate
        ? relevantRecord.account.governingTokenDepositAmount.toNumber()
        : 0,
      totalVotesCount: relevantRecord.account.totalVotesCount,
      unrelinquishedVotesCount: relevantRecord.account.unrelinquishedVotesCount,
      outstandingProposalCount: relevantRecord.account.outstandingProposalCount,
    };
  } catch (error: any) {
    throw new Error(`Failed to get voting power: ${error.message}`);
  }
}
