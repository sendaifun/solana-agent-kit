import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SplGovernanceProgram } from "./splGovernanceProgram"; // Updated import

export class GovernanceAgent {
  private governanceProgram: SplGovernanceProgram;

  constructor(connection: Connection, governanceProgramId: PublicKey) {
    this.governanceProgram = new SplGovernanceProgram(
      connection,
      governanceProgramId,
    );
  }

  async submitProposal(
    realm: PublicKey,
    governance: PublicKey,
    tokenOwnerRecord: PublicKey,
    name: string,
    description: string,
    governingTokenMint: PublicKey,
    proposalIndex: number,
    governanceAuthority: PublicKey, // New argument
    payer: PublicKey, // New argument
    options: string[] = [], // Default to an empty array
    useDenyOption: boolean = false, // Default to false
    voterWeightRecord?: PublicKey, // Optional
  ) {
    const instructions: TransactionInstruction[] = [];
    return await this.governanceProgram.createProposal(
      realm,
      governance,
      tokenOwnerRecord,
      name,
      description,
      governingTokenMint,
      proposalIndex,
      instructions,
      governanceAuthority,
      payer,
      options,
      useDenyOption,
      voterWeightRecord,
    );
  }

  async cancelProposal(
    realm: PublicKey,
    governance: PublicKey,
    proposal: PublicKey,
    tokenOwnerRecord: PublicKey,
    governanceAuthority: PublicKey, // New argument
  ) {
    const instructions: TransactionInstruction[] = [];
    return await this.governanceProgram.cancelProposal(
      realm,
      governance,
      proposal,
      tokenOwnerRecord,
      governanceAuthority,
      instructions,
    );
  }

  async monitorProposal(proposalAddress: PublicKey) {
    try {
      return await this.governanceProgram.getProposalStatus(proposalAddress);
    } catch (error) {
      console.error("Error monitoring proposal:", error);
      throw error;
    }
  }

  async executeProposal(
    governance: PublicKey,
    proposal: PublicKey,
    transactionAddress: PublicKey, // New argument
    transactionInstructions: TransactionInstruction[], // New argument
  ) {
    const instructions: TransactionInstruction[] = [];
    try {
      return await this.governanceProgram.executeProposal(
        governance,
        proposal,
        instructions,
        transactionAddress,
        transactionInstructions,
      );
    } catch (error) {
      console.error("Error executing proposal:", error);
      throw error;
    }
  }
}
