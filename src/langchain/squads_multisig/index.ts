import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCreate2by2Multisig extends Tool {
  name = "create_2by2_multisig";
  description = `Create a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
    
    Note: For one AI agent, only one 2-by-2 multisig can be created as it is pair-wise.
  
    Inputs (JSON string):
    - creator: string, the public key of the creator (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const creator = new PublicKey(inputFormat.creator);

      const multisig = await this.solanaKit.createSquadsMultisig(creator);

      return JSON.stringify({
        status: "success",
        message: "2-by-2 multisig account created successfully",
        multisig,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CREATE_2BY2_MULTISIG_ERROR",
      });
    }
  }
}

export class SolanaDepositTo2by2Multisig extends Tool {
  name = "deposit_to_2by2_multisig";
  description = `Deposit funds to a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
  
    Inputs (JSON string):
    - amount: number, the amount to deposit in SOL (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const amount = new Decimal(inputFormat.amount);

      const tx = await this.solanaKit.depositToMultisig(amount.toNumber());

      return JSON.stringify({
        status: "success",
        message: "Funds deposited to 2-by-2 multisig account successfully",
        transaction: tx,
        amount: amount.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DEPOSIT_TO_2BY2_MULTISIG_ERROR",
      });
    }
  }
}

export class SolanaTransferFrom2by2Multisig extends Tool {
  name = "transfer_from_2by2_multisig";
  description = `Create a transaction to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
  
    Inputs (JSON string):
    - amount: number, the amount to transfer in SOL (required).
    - recipient: string, the public key of the recipient (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const amount = new Decimal(inputFormat.amount);
      const recipient = new PublicKey(inputFormat.recipient);

      const tx = await this.solanaKit.transferFromMultisig(
        amount.toNumber(),
        recipient,
      );

      return JSON.stringify({
        status: "success",
        message: "Transaction added to 2-by-2 multisig account successfully",
        transaction: tx,
        amount: amount.toString(),
        recipient: recipient.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "TRANSFER_FROM_2BY2_MULTISIG_ERROR",
      });
    }
  }
}

export class SolanaCreateProposal2by2Multisig extends Tool {
  name = "create_proposal_2by2_multisig";
  description = `Create a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
    
    If transactionIndex is not provided, the latest index will automatically be fetched and used.
  
    Inputs (JSON string):
    - transactionIndex: number, the index of the transaction (optional).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const transactionIndex = inputFormat.transactionIndex ?? undefined;

      const tx = await this.solanaKit.createMultisigProposal(transactionIndex);

      return JSON.stringify({
        status: "success",
        message: "Proposal created successfully",
        transaction: tx,
        transactionIndex: transactionIndex?.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CREATE_PROPOSAL_2BY2_MULTISIG_ERROR",
      });
    }
  }
}

export class SolanaApproveProposal2by2Multisig extends Tool {
  name = "approve_proposal_2by2_multisig";
  description = `Approve a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
    
    If proposalIndex is not provided, the latest index will automatically be fetched and used.
  
    Inputs (JSON string):
    - proposalIndex: number, the index of the proposal (optional).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const proposalIndex = inputFormat.proposalIndex ?? undefined;

      const tx = await this.solanaKit.approveMultisigProposal(proposalIndex);

      return JSON.stringify({
        status: "success",
        message: "Proposal approved successfully",
        transaction: tx,
        proposalIndex: proposalIndex.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "APPROVE_PROPOSAL_2BY2_MULTISIG_ERROR",
      });
    }
  }
}

export class SolanaRejectProposal2by2Multisig extends Tool {
  name = "reject_proposal_2by2_multisig";
  description = `Reject a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
    
    If proposalIndex is not provided, the latest index will automatically be fetched and used.
  
    Inputs (JSON string):
    - proposalIndex: number, the index of the proposal (optional).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const proposalIndex = inputFormat.proposalIndex ?? undefined;

      const tx = await this.solanaKit.rejectMultisigProposal(proposalIndex);

      return JSON.stringify({
        status: "success",
        message: "Proposal rejected successfully",
        transaction: tx,
        proposalIndex: proposalIndex.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "REJECT_PROPOSAL_2BY2_MULTISIG_ERROR",
      });
    }
  }
}

export class SolanaExecuteProposal2by2Multisig extends Tool {
  name = "execute_proposal_2by2_multisig";
  description = `Execute a proposal/transaction to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
    
    If proposalIndex is not provided, the latest index will automatically be fetched and used.
  
    Inputs (JSON string):
    - proposalIndex: number, the index of the proposal (optional).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const proposalIndex = inputFormat.proposalIndex ?? undefined;

      const tx = await this.solanaKit.executeMultisigTransaction(proposalIndex);

      return JSON.stringify({
        status: "success",
        message: "Proposal executed successfully",
        transaction: tx,
        proposalIndex: proposalIndex.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "EXECUTE_PROPOSAL_2BY2_MULTISIG_ERROR",
      });
    }
  }
}
