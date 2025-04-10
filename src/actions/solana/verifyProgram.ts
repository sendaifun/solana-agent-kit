import { verify_program } from "../../tools";
import { Action } from "../../types/action";
import { z } from "zod";

const verifyProgramAction: Action = {
  name: "VERIFY_PROGRAM",
  similes: [
    "verify program",
    "verify solana program",
    "verify smart contract",
    "verify contract",
    "verify deployment",
  ],
  description:
    "Verify a Solana program deployment by linking it to its GitHub repository and signing the verification with the agent's wallet",
  examples: [
    [
      {
        input: {
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          repoUrl: "https://github.com/solana-labs/solana-program-library",
        },
        output: {
          status: "success",
          message: "Program verification initiated successfully",
          pda: "verification_pda_address",
        },
        explanation: "Verify a Solana program with its GitHub repository",
      },
    ],
  ],
  schema: z.object({
    programId: z.string(),
    repoUrl: z.string().url(),
  }),
  handler: async (input: Record<string, any>, agent: any) => {
    try {
      const result = await verify_program(
        agent,
        input.programId,
        input.repoUrl
      );

      return {
        status: "success",
        message: result.message,
        verificationId: result.verificationId,
        programId: input.programId,
        repoUrl: input.repoUrl
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Program verification failed: ${error.message}`,
      };
    }
  },
};

export default verifyProgramAction; 