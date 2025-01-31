import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export interface VerificationOptions {
  verifyProgramId: PublicKey | null;
  libName: string | null;
  bpfFlag: boolean | null;
  cargoArgs: string[] | null;
}

export interface VerificationResponse {
  verificationPda: string;
  status: "success" | "error";
  message: string;
  jobId?: string;
}

export interface VerificationInput {
  programId: string;
  repository: string;
  commitHash: string;
  verifyProgramId?: string;
  libName?: string;
  bpfFlag?: boolean;
  cargoArgs?: string[];
}

interface StatusCheckInput {
  programId: string;
}

export class SolanaProgramVerificationTool extends Tool {
  name = "solana_program_verification";
  description = `Verify a Solana program using its source code repository.
  Input is a JSON string with:
  - programId: string (required) - The program ID to verify
  - repository: string (required) - The source code repository to verify
  - commitHash: string (required) - The commit hash to verify against
  - verifyProgramId: string (optional) - The verification program ID to use, defaults to the program ID of the agent
  - libName: string (optional) - The name of the library to verify, defaults to the repository name
  - bpfFlag: boolean (optional) - Whether to use the bpf flag for verification, defaults to false
  - cargoArgs: string[] (optional) - Additional cargo arguments to pass to the verification process`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput: VerificationInput = JSON.parse(input);

      this.validateInput(parsedInput);

      const options: VerificationOptions = {
        verifyProgramId: parsedInput.verifyProgramId
          ? new PublicKey(parsedInput.verifyProgramId)
          : null,
        libName: parsedInput.libName || "",
        bpfFlag: parsedInput.bpfFlag || false,
        cargoArgs: parsedInput.cargoArgs || [],
      };

      const result = await this.solanaKit.verifyProgram(
        parsedInput.programId,
        parsedInput.repository,
        parsedInput.commitHash,
        // @ts-ignore
        options,
      );

      return this.formatSuccessResponse(result);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  async checkStatus(input: string): Promise<string> {
    try {
      const parsedInput: StatusCheckInput = JSON.parse(input);

      if (!parsedInput.programId) {
        throw new Error("Program ID is required");
      }

      const status = await this.solanaKit.checkVerificationStatus(
        parsedInput.programId,
      );

      return JSON.stringify({
        status: "success",
        ...status,
      });
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  private validateInput(input: VerificationInput): void {
    if (!input.programId) {
      throw new Error("Program ID is required");
    }
    if (!input.repository) {
      throw new Error("Repository URL is required");
    }
    if (!input.commitHash) {
      throw new Error("Commit hash is required");
    }
  }

  private formatSuccessResponse(result: VerificationResponse): string {
    return JSON.stringify({
      status: "success",
      verificationPda: result.verificationPda,
      message: result.message,
      jobId: result.jobId,
    });
  }

  private formatErrorResponse(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return JSON.stringify({
      status: "error",
      message: errorMessage,
      code:
        error instanceof Error && "code" in error
          ? (error as any).code
          : "UNKNOWN_ERROR",
    });
  }
}
