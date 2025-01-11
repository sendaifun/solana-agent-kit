import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  getSignatoryRecordAddress,
  Governance,
  Proposal,
  ProposalState,
  TokenOwnerRecord,
  VoteType,
  withCreateProposal,
  withInsertTransaction,
  withSignOffProposal,
  BorshAccountParser,
  GovernanceAccountParser,
} from "@solana/spl-governance";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";

const GOVERNANCE_PROGRAM_ID = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
);

/**
 * Create a new governance proposal
 * @param agent SolanaAgentKit instance
 * @param realm Realm public key
 * @param governance Governance account public key
 * @param name Proposal name
 * @param description Proposal description
 * @param instructions Instructions to be executed if proposal passes
 * @returns Transaction signature
 */
export async function createGovernanceProposal(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governance: PublicKey,
  name: string,
  description: string,
  instructions: TransactionInstruction[],
): Promise<string> {
  try {
    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      GOVERNANCE_PROGRAM_ID,
    );

    // Get token owner record
    const [tokenOwnerRecord] = await PublicKey.findProgramAddress(
      [
        Buffer.from("governance"),
        realm.toBuffer(),
        governance.toBuffer(),
        agent.wallet_address.toBuffer(),
      ],
      GOVERNANCE_PROGRAM_ID,
    );

    // Create proposal transaction
    const proposalAddress = await withCreateProposal(
      instructions,
      GOVERNANCE_PROGRAM_ID,
      programVersion,
      realm,
      governance,
      tokenOwnerRecord,
      name,
      description,
      agent.wallet_address,
      governance,
      undefined,
      VoteType.SINGLE_CHOICE,
      ["Approve"],
      true,
      agent.wallet_address,
    );

    // Insert instructions into proposal
    for (const instruction of instructions) {
      const insertInstructions: TransactionInstruction[] = [];
      await withInsertTransaction(
        insertInstructions,
        GOVERNANCE_PROGRAM_ID,
        programVersion,
        governance,
        proposalAddress,
        tokenOwnerRecord,
        agent.wallet_address,
        0,
        0,
        0,
        [
          {
            programId: instruction.programId,
            accounts: instruction.keys,
            data: instruction.data,
          },
        ],
        agent.wallet_address,
      );
      instructions.push(...insertInstructions);
    }

    // Sign off proposal
    const signatory = await getSignatoryRecordAddress(
      GOVERNANCE_PROGRAM_ID,
      proposalAddress,
      agent.wallet_address,
    );

    const signOffInstructions: TransactionInstruction[] = [];
    await withSignOffProposal(
      signOffInstructions,
      GOVERNANCE_PROGRAM_ID,
      programVersion,
      realm,
      governance,
      proposalAddress,
      agent.wallet_address,
      signatory,
      undefined,
    );
    instructions.push(...signOffInstructions);

    // Send transaction
    const signature = await agent.connection.sendTransaction(
      new Transaction(),
      [agent.wallet],
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to create governance proposal: ${error.message}`);
  }
}

/**
 * Cancel an existing governance proposal
 * @param agent SolanaAgentKit instance
 * @param proposal Proposal public key
 * @returns Transaction signature
 */
export async function cancelGovernanceProposal(
  agent: SolanaAgentKit,
  proposal: PublicKey,
): Promise<string> {
  try {
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      GOVERNANCE_PROGRAM_ID,
    );

    const proposalAccount = await agent.connection.getAccountInfo(proposal);
    if (!proposalAccount) {
      throw new Error("Proposal account not found");
    }
    const proposalData = GovernanceAccountParser(Proposal)(
      proposal,
      proposalAccount,
    );

    if (proposalData.account.state !== ProposalState.Draft) {
      throw new Error("Can only cancel proposals in draft state");
    }

    const transaction = new Transaction().add(
      await proposalData.account.createCancelProposalTransaction(
        GOVERNANCE_PROGRAM_ID,
        proposal,
        agent.wallet_address,
        agent.wallet_address,
      ),
    );

    const signature = await agent.connection.sendTransaction(transaction, [
      agent.wallet,
    ]);

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to cancel governance proposal: ${error.message}`);
  }
}

/**
 * Execute an approved governance proposal
 * @param agent SolanaAgentKit instance
 * @param proposal Proposal public key
 * @returns Transaction signature
 */
export async function executeGovernanceProposal(
  agent: SolanaAgentKit,
  proposal: PublicKey,
): Promise<string> {
  try {
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      GOVERNANCE_PROGRAM_ID,
    );

    const proposalAccount = await agent.connection.getAccountInfo(proposal);
    if (!proposalAccount) {
      throw new Error("Proposal account not found");
    }
    const proposalData = GovernanceAccountParser(Proposal)(
      proposal,
      proposalAccount,
    );

    if (proposalData.account.state !== ProposalState.Succeeded) {
      throw new Error("Can only execute proposals in succeeded state");
    }

    const transaction = new Transaction().add(
      await proposalData.account.createExecuteTransactionInstruction(
        GOVERNANCE_PROGRAM_ID,
        proposal,
        agent.wallet_address,
      ),
    );

    const signature = await agent.connection.sendTransaction(transaction, [
      agent.wallet,
    ]);

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to execute governance proposal: ${error.message}`);
  }
}

/**
 * Get the current state of a governance proposal
 * @param agent SolanaAgentKit instance
 * @param proposal Proposal public key
 * @returns Proposal state and details
 */
export async function getGovernanceProposalState(
  agent: SolanaAgentKit,
  proposal: PublicKey,
): Promise<{
  state: ProposalState;
  name: string;
  description: string;
  yesVotes: number;
  noVotes: number;
}> {
  try {
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      GOVERNANCE_PROGRAM_ID,
    );

    const proposalAccount = await agent.connection.getAccountInfo(proposal);
    if (!proposalAccount) {
      throw new Error("Proposal account not found");
    }
    const proposalData = GovernanceAccountParser(Proposal)(
      proposal,
      proposalAccount,
    );

    return {
      state: proposalData.account.state,
      name: proposalData.account.name,
      description: proposalData.account.descriptionLink,
      yesVotes: proposalData.account.getYesVoteCount(),
      noVotes: proposalData.account.getNoVoteCount(),
    };
  } catch (error: any) {
    throw new Error(`Failed to get proposal state: ${error.message}`);
  }
}
