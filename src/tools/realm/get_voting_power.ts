import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit, VotingPowerInfo } from "../../index";
import { getTokenOwnerRecordsByOwner } from "@solana/spl-governance";
import { GOVERNANCE_PROGRAM_ADDRESS } from "../../constants";

/**
 * Get current voting power for a wallet in a realm including delegated power
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param realm {PublicKey} The public key of the realm
 * @param governingTokenMint {PublicKey} The mint of the governing token to check power for
 *
 * @returns {Promise<VotingPowerInfo>} VotingPowerInfo containing voting power details:
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
): Promise<VotingPowerInfo> {
  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(GOVERNANCE_PROGRAM_ADDRESS);

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
