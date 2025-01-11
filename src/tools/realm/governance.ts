import { PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import {
  getGovernanceProgramVersion,
  getTokenOwnerRecordAddress,
  getVoteRecordAddress,
  getProposal,
  Vote,
  VoteChoice,
  withCastVote,
  getRealm,
  VoteKind,
  getTokenOwnerRecordsByOwner,
  withSetGovernanceDelegate,
} from "@solana/spl-governance";
import { BN } from "@coral-xyz/anchor";

/**
 * Cast a vote on a governance proposal
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param realmAccount {PublicKey} The public key of the realm
 * @param proposalAccount {PublicKey} The public key of the proposal being voted on
 * @param voteType {"yes" | "no"} Type of vote to cast
 *
 * @returns {Promise<string>} Transaction signature
 *
 * @throws Will throw an error if the vote transaction fails
 *
 * @example
 * const signature = await castVote(
 *   agent,
 *   new PublicKey("realm-address"),
 *   new PublicKey("proposal-address"),
 *   "yes"
 * );
 */
export async function castGovernanceVote(
  agent: SolanaAgentKit,
  realmAccount: PublicKey,
  proposalAccount: PublicKey,
  voteType: "yes" | "no",
): Promise<string> {
  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(
      "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    );

    // Get governance program version for the connected chain
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );

    // Fetch realm info and get governing token mint
    const realmInfo = await getRealm(connection, realmAccount);
    const governingTokenMint = realmInfo.account.communityMint;

    // Get voter's token owner record
    const tokenOwnerRecord = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realmAccount,
      governingTokenMint,
      agent.wallet_address,
    );

    // Get voter's vote record
    const voteRecord = await getVoteRecordAddress(
      governanceProgramId,
      proposalAccount,
      tokenOwnerRecord,
    );

    // Get proposal data
    const proposal = await getProposal(connection, proposalAccount);

    // Construct vote object
    const vote = new Vote({
      voteType: voteType === "no" ? VoteKind.Deny : VoteKind.Approve,
      approveChoices:
        voteType === "yes"
          ? [new VoteChoice({ rank: 0, weightPercentage: 100 })]
          : [],
      deny: voteType === "no",
      veto: false,
    });

    // Create and configure transaction
    const transaction = new Transaction();

    await withCastVote(
      transaction.instructions,
      governanceProgramId,
      programVersion,
      realmAccount,
      proposal.account.governance,
      proposalAccount,
      proposal.account.tokenOwnerRecord,
      tokenOwnerRecord,
      proposal.account.governingTokenMint,
      voteRecord,
      vote,
      agent.wallet_address,
    );

    // Sign and send transaction
    transaction.sign(agent.wallet);
    const signature = await agent.connection.sendRawTransaction(
      transaction.serialize(),
      {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      },
    );

    // Confirm transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to cast governance vote: ${error.message}`);
  }
}

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

/**
 * Delegate voting power to another wallet in a governance realm
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param realm {PublicKey} The public key of the realm
 * @param governingTokenMint {PublicKey} The mint of the governing token to delegate
 * @param delegate {PublicKey} The wallet address to delegate voting power to
 *
 * @returns {Promise<string>} Transaction signature
 *
 * @throws {Error} If public keys are invalid
 * @throws {Error} If delegation transaction fails
 * @throws {Error} If token owner record doesn't exist
 *
 * @example
 * const signature = await delegateVotingPower(
 *   agent,
 *   new PublicKey("realm-address"),
 *   new PublicKey("token-mint-address"),
 *   new PublicKey("delegate-address")
 * );
 */
export async function delegateVotingPower(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
  delegate: PublicKey,
): Promise<string> {
  // Validate public keys
  // if (
  //   !PublicKey.isOnCurve(realm.toBytes()) ||
  //   !PublicKey.isOnCurve(governingTokenMint.toBytes()) ||
  //   !PublicKey.isOnCurve(delegate.toBytes())
  // ) {
  //   throw new Error(
  //     "Invalid public key provided for realm, governingTokenMint, or delegate",
  //   );
  // }

  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(
      "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    );

    // Get governance program version for the connected chain
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );
    // Get token owner record for the current wallet
    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realm,
      governingTokenMint,
      agent.wallet_address,
    );

    // Create transaction
    const transaction = new Transaction();

    // Add set delegate instruction
    await withSetGovernanceDelegate(
      transaction.instructions,
      governanceProgramId,
      programVersion,
      realm,
      governingTokenMint,
      tokenOwnerRecordAddress,
      agent.wallet_address, // governanceAuthority
      delegate,
    );

    // Send and confirm transaction
    transaction.sign(agent.wallet);
    const signature = await agent.connection.sendRawTransaction(
      transaction.serialize(),
      {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      },
    );

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error: any) {
    // Handle specific error cases
    if (error.message.includes("Account not found")) {
      throw new Error("No token owner record found - deposit tokens first");
    }
    if (error.message.includes("Invalid delegate")) {
      throw new Error("Invalid delegate address provided");
    }
    throw new Error(`Failed to delegate voting power: ${error.message}`);
  }
}

/**
 * Remove voting power delegation
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param realm {PublicKey} The public key of the realm
 * @param governingTokenMint {PublicKey} The mint of the governing token
 *
 * @returns {Promise<string>} Transaction signature
 *
 * @example
 * const signature = await removeDelegation(
 *   agent,
 *   new PublicKey("realm-address"),
 *   new PublicKey("token-mint-address")
 * );
 */
export async function removeDelegation(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
): Promise<string> {
  // Can use the same function with null delegate to remove delegation
  return delegateVotingPower(
    agent,
    realm,
    governingTokenMint,
    PublicKey.default, // Pass default/null public key to remove delegation
  );
}

/**
 * Get detailed voting outcome for a specific governance proposal
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param proposalAccount {PublicKey} The public key of the proposal account
 *
 * @returns {Promise<Object>} Object containing:
 * - state: Current proposal state
 * - yesVotes: Number of approve votes
 * - noVotes: Number of deny votes
 * - abstainVotes: Number of abstain votes
 * - vetoVotes: Weight of veto votes
 * - isVoteFinalized: Whether voting has concluded
 * - name: Proposal name
 * - description: Link to proposal description
 * - votingStartedAt: Timestamp when voting started
 * - votingCompletedAt: Timestamp when voting completed
 * - signatoriesCount: Number of required signatories
 * - signatoriesSignedOff: Number of signatories who signed
 *
 * @throws {Error} If proposal account is invalid
 * @throws {Error} If proposal is not found
 *
 * @example
 * const outcome = await getVotingOutcome(
 *   agent,
 *   new PublicKey("proposal-address")
 * );
 */
export async function getVotingOutcome(
  agent: SolanaAgentKit,
  proposalAccount: PublicKey,
): Promise<{
  state: string;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  vetoVotes: string;
  isVoteFinalized: boolean;
  name: string;
  description: string;
  votingStartedAt: number | null;
  votingCompletedAt: number | null;
  signatoriesCount: number;
  signatoriesSignedOff: number;
}> {
  // Validate proposal account
  if (!PublicKey.isOnCurve(proposalAccount.toBytes())) {
    throw new Error("Invalid proposal account address");
  }

  try {
    const connection = agent.connection;

    // Get proposal data using supported API
    const proposalData = await getProposal(connection, proposalAccount);

    if (!proposalData) {
      throw new Error("Proposal not found");
    }

    const proposal = proposalData.account;

    return {
      state: proposal.state.toString(),
      yesVotes: proposal.getYesVoteCount().toString(),
      noVotes: proposal.getNoVoteCount().toString(),
      abstainVotes: proposal.abstainVoteWeight?.toString() || "0",
      vetoVotes: proposal.vetoVoteWeight.toString(),
      isVoteFinalized: proposal.isVoteFinalized(),
      name: proposal.name,
      description: proposal.descriptionLink,
      votingStartedAt: proposal.votingAt?.toNumber() || null,
      votingCompletedAt: proposal.votingCompletedAt?.toNumber() || null,
      signatoriesCount: proposal.signatoriesCount,
      signatoriesSignedOff: proposal.signatoriesSignedOffCount,
    };
  } catch (error: any) {
    throw new Error(`Failed to get voting outcome: ${error.message}`);
  }
}
