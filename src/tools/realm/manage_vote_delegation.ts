import { PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import {
  getGovernanceProgramVersion,
  getTokenOwnerRecordAddress,
  withSetGovernanceDelegate,
} from "@solana/spl-governance";
import { GOVERNANCE_PROGRAM_ADDRESS } from "../../constants";

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
export async function manageVoteDelegation(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
  delegate: PublicKey,
): Promise<string> {
  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(GOVERNANCE_PROGRAM_ADDRESS);

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
