import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { get_program_verification_status } from "../tools";

const getProgramVerificationStatus: Action = {
  name: "OSEC_GET_PROGRAM_VERIFICATION_STATUS",
  description: "Get program verification status",
  similes: [
    "get solana program verification status",
    "fetch solana program verification steatus",
  ],
  examples: [
    [
      {
        input: {
          address: "mRXspNQ2wBD4ekkCE2wP5gxKAjuHovJzqTh42KY3Zbn",
        },
        output: {
          is_verified: true,
          message: "On chain program verified",
          on_chain_hash:
            "96b9c38c4c2a0a3b84742b42b0b4d879de0799d77301df36f72fc1556b560bf9",
          executable_hash:
            "96b9c38c4c2a0a3b84742b42b0b4d879de0799d77301df36f72fc1556b560bf9",
          repo_url:
            "https://github.com/0xobedient/solana-program-verifier-test/tree/a508ea5427072dfd87c374b0c9054a3b45d56dda",
          commit: "a508ea5427072dfd87c374b0c9054a3b45d56dda",
          last_verified_at: "2025-07-09T09:14:13.113171",
          is_frozen: false,
        },
        explanation: "program verification status is successfully fetched",
      },
    ],
  ],
  schema: z.object({
    address: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { address } = input;

      const data = await get_program_verification_status({ address });

      return {
        status: "success",
        data,
        message: "Solana program verification status is successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get program verification status ${error.message}`,
        code: error.code || "OTTERSEC_GET_PROGRAM_VERIFICATION_STATUS_FAILED",
      };
    }
  },
};

export default getProgramVerificationStatus;
