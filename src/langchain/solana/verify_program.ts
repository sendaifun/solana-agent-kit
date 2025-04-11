import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";
import { createHash } from "crypto";
import { verify_program } from "../../tools";

export class SolanaVerifyProgramTool extends Tool {
  name = "solana_verify_program";
  description = `Verify a Solana program deployment by linking it to its GitHub repository and signing the verification with the agent's wallet.
  
  Inputs (input is a JSON string):
  programId: string, eg "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" (required)
  repoUrl: string, eg "https://github.com/solana-labs/solana-program-library" (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      
      if (!parsedInput.programId) {
        throw new Error("programId is required");
      }
      
      if (!parsedInput.repoUrl) {
        throw new Error("repoUrl is required");
      }

      // Use the core verify_program tool that handles all verification logic
      const result = await verify_program(
        this.solanaKit,
        parsedInput.programId,
        parsedInput.repoUrl
      );
      
      return JSON.stringify({
        status: result.status,
        message: result.message,
        verificationId: result.verificationId,
        programId: parsedInput.programId,
        repoUrl: parsedInput.repoUrl
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
} 