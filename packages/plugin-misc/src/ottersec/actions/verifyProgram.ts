import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { verify_program } from "../tools";

const verifyProgram: Action = {
  name: "OSEC_VERIFY_PROGRAM",
  description: "Verify a Solana program",
  similes: [
    "verify solana program",
    "prove solana program",
    "confirm solana program",
  ],
  examples: [
    [
      {
        input: {
          program_id: "mRXspNQ2wBD4ekkCE2wP5gxKAjuHovJzqTh42KY3Zbn",
          repository:
            "https://github.com/0xobedient/solana-program-verifier-test",
          commit_hash: "a508ea5427072dfd87c374b0c9054a3b45d56dda",
        },
        output: {
          status: "completed",
          request_id: "18314584-6fe4-47ac-acbd-a71e1446a64f",
          message: "Verification already completed.",
        },
        explanation: "solana program is successfully verified",
      },
    ],
  ],
  schema: z.object({
    program_id: z.string(),
    repository: z.string(),
    commit_hash: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { program_id, repository, commit_hash } = input;

      const data = await verify_program({
        program_id,
        repository,
        commit_hash,
      });

      return {
        status: "success",
        data,
        message: "Solana program is successfully verified",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to verify solana program ${error.message}`,
        code: error.code || "OTTERSEC_VERIFY_PROGRAM_FAILED",
      };
    }
  },
};

export default verifyProgram;
