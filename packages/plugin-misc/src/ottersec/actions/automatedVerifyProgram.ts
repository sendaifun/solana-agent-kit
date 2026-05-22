import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { automated_verify_program } from "../tools/automated_verify_program";

const automatedVerifyProgramAction: Action = {
  name: "AUTOMATED_VERIFY_PROGRAM_ACTION",
  description:
    "Automatically verify a Solana program using its GitHub repository and program ID. This tool fetches the latest commit hash and deployment slot automatically.",
  similes: [
    "verify program from repo",
    "automatic solana program verification",
    "sign verification pda for repo",
  ],
  examples: [
    [
      {
        input: {
          programId: "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY",
          repoUrl: "https://github.com/Ellipsis-Labs/phoenix-v1",
        },
        output: {
          status: "success",
          data: {
            signature: "5Kj...",
            pda: "2CN...",
          },
          message: "Solana program verification PDA is successfully generated",
        },
        explanation: "The agent automatically fetched the commit hash and deployment slot to sign the verification PDA.",
      },
    ],
  ],
  schema: z.object({
    programId: z.string(),
    repoUrl: z.string().url(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { programId, repoUrl } = input;

      const result = await automated_verify_program(agent, programId, repoUrl);

      return {
        status: "success",
        data: result,
        message: "Solana program verification PDA is successfully generated",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to automate program verification: ${error.message}`,
        code: "AUTOMATED_VERIFY_PROGRAM_FAILED",
      };
    }
  },
};

export default automatedVerifyProgramAction;
