import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { get_program_build_log } from "../tools";

const getProgramBuildLog: Action = {
  name: "OSEC_GET_PROGRAM_BUILD_LOG",
  description: "Get program build for a solana program",
  similes: [
    "get a build log",
    "get solana program build log",
    "fetch a build log",
    "fetch solana program build log",
  ],
  examples: [
    [
      {
        input: {
          address: "mRXspNQ2wBD4ekkCE2wP5gxKAjuHovJzqTh42KY3Zbn",
        },
        output: {},
        explanation: "solana program build log successfully fetched",
      },
    ],
  ],
  schema: z.object({
    address: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { address } = input;

      const data = await get_program_build_log({ address });

      return {
        status: "success",
        data,
        message: "Solana program build log is successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch solana program build log ${error.message}`,
        code: error.code || "OTTERSEC_GET_PROGRAM_BUILD_LOG_FAILED",
      };
    }
  },
};

export default getProgramBuildLog;
