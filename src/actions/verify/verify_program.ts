import { z } from "zod";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { verifyProgram } from "../../tools";

const verifyProgramAction: Action = {
  name: "VERIFY_PROGRAM",
  similes: [
    "verify program",
    "check program",
    "validate program",
    "verify solana program",
    "check contract",
    "verify smart contract",
  ],
  description:
    "Verify a Solana program by comparing its on-chain bytecode with the source code from a GitHub repository.",
  examples: [
    [
      {
        input: {
          programId: "FWEYpBAf9WsemQiNbAewhyESfR38GBBHLrCaU3MpEKWv",
          github: "https://github.com/solana-developers/verified-program",
          commit: "5b82b86f02afbde330dff3e1847bed2d42069f4e",
        },
        output: {
          status: "success",
          message: "Program verification completed",
          details: {
            programId: "FWEYpBAf9WsemQiNbAewhyESfR38GBBHLrCaU3MpEKWv",
            repository: "https://github.com/solana-developers/verified-program",
            commit: "5b82b86f02afbde330dff3e1847bed2d42069f4e",
            verificationResult: {
              verified: true,
              message: "Program verified successfully",
            },
          },
        },
        explanation: "Verify the example program with specific commit hash",
      },
    ],
    [
      {
        input: {
          programId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
          github:
            "https://github.com/solana-labs/solana-program-library/tree/070934ae4f2975d602caa6bd1e88b2c010e4cab5",
          commit: "070934ae4f2975d602caa6bd1e88b2c010e4cab5",
        },
        output: {
          status: "success",
          message: "Program verification completed",
          details: {
            programId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
            repository: "https://github.com/solana-labs/solana-program-library",
            commit: "070934ae4f2975d602caa6bd1e88b2c010e4cab5",
            verificationResult: {
              verified: true,
              message: "Token program verified successfully",
            },
          },
        },
        explanation: "Verify the Solana Token program from SPL",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().describe("The program ID to verify"),
    repository: z
      .string()
      .describe("The GitHub repository URL to verify against"),
    commitHash: z
      .string()
      .describe(
        "The commit hash to verify against, defaults to the latest commit",
      ),
    options: z
      .object({
        libName: z
          .string()
          .describe(
            "The name of the library to verify, defaults to the repository name",
          )
          .optional(),
        bpfFlag: z
          .boolean()
          .describe(
            "Whether to use the bpf flag for verification, defaults to false",
          )
          .optional(),
        cargoArgs: z
          .array(z.string())
          .describe(
            "Additional cargo arguments to pass to the verification process",
          )
          .optional(),
        verifyProgramId: z
          .string()
          .describe(
            "The program ID to use for verification, defaults to the program ID of the agent",
          )
          .optional(),
      })
      .optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { programId, repository, commitHash, options } = input;
      const result = await verifyProgram(
        agent,
        programId,
        repository,
        commitHash,
        options,
      );
      return result;
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to verify program: ${error.message}`,
      };
    }
  },
};

export default verifyProgramAction;
