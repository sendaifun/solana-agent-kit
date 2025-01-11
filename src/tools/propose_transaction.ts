import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  Signer,
} from "@solana/web3.js";
import {
  withCreateProposal,
  VoteType,
  getGovernanceProgramVersion,
  getRealm,
  getTokenOwnerRecordAddress,
  MultiChoiceType,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Propose a transaction to the Solana governance program.
 *
 * @param agent           The SolanaAgentKit instance.
 * @param realmId         The public key of the realm as a string.
 * @param governanceId    The public key of the governance as a string.
 * @param name            The proposal name.
 * @param descriptionLink The proposal description link.
 * @param options         The proposal options.
 * @param voteType        The type of vote ("single" or "multi").
 * @param choiceType      The type of multi-choice voting ("FullWeight" or "Weighted") for multi-choice votes.
 * @param useDenyOption   Whether to use the deny option (default: true).
 * @returns               The public key of the created proposal.
 */
export async function proposeTransaction(
  agent: SolanaAgentKit,
  realmId: string,
  governanceId: string,
  name: string,
  descriptionLink: string,
  options: string[],
  voteType: string,
  choiceType: string = "FullWeight",
  useDenyOption: boolean = true,
): Promise<PublicKey> {
  const connection = agent.connection;
  const realmPublicKey = new PublicKey(realmId);
  const governancePublicKey = new PublicKey(governanceId);
  const governanceProgramId = new PublicKey(
    "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
  );

  let mappedVoteType: VoteType;
  if (voteType.toLowerCase() === "single") {
    mappedVoteType = VoteType.SINGLE_CHOICE;
  } else if (voteType.toLowerCase() === "multi") {
    const choiceTypeMapping: { [key: string]: MultiChoiceType } = {
      fullweight: MultiChoiceType.FullWeight,
      weighted: MultiChoiceType.Weighted,
    };

    const mappedChoiceType = choiceTypeMapping[choiceType.toLowerCase()];
    if (!mappedChoiceType) {
      throw new Error(
        `Invalid choiceType '${choiceType}'. Allowed values are 'FullWeight' or 'Weighted' for multi-choice votes.`,
      );
    }

    mappedVoteType = VoteType.MULTI_CHOICE(
      mappedChoiceType,
      1,
      options.length,
      1,
    );
  } else {
    throw new Error(
      `Invalid voteType '${voteType}'. Allowed values are 'single' or 'multi'.`,
    );
  }

  try {
    // Fetch the program version
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );

    // Fetch realm and token information
    const realm = await getRealm(connection, realmPublicKey);
    const governingTokenMint = realm.account.communityMint;

    // Get the token owner record
    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realmPublicKey,
      governingTokenMint,
      agent.wallet.publicKey,
    );

    // Create the proposal
    const transaction = new Transaction();
    const instructions: TransactionInstruction[] = [];

    const proposalPublicKey = await withCreateProposal(
      instructions,
      governanceProgramId,
      programVersion,
      realmPublicKey,
      governancePublicKey,
      tokenOwnerRecordAddress,
      name,
      descriptionLink,
      governingTokenMint,
      agent.wallet.publicKey,
      undefined,
      mappedVoteType,
      options,
      useDenyOption,
      agent.wallet.publicKey,
    );

    transaction.add(...instructions);

    // Send and confirm the transaction
    await sendAndConfirmTransaction(connection, transaction, [
      agent.wallet as Signer,
    ]);

    return proposalPublicKey;
  } catch (error: any) {
    throw new Error(`Failed to propose transaction: ${error.message}`);
  }
}
