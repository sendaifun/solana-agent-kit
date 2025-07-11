import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { get_verification_job_status } from "../tools";

const getVerificationJobStatus: Action = {
  name: "OSEC_GET_VERIFICATION_JOB_STATUS",
  description: "Get status of an async verification job",
  similes: [
    "get status of verification job",
    "fetch status of verification job",
    "get verification job status",
    "fetch verification job status",
  ],
  examples: [
    [
      {
        input: {
          job_id: "18314584-6fe4-47ac-acbd-a71e1446a64f",
        },
        output: {
          status: "completed",
          message: "Job completed",
          on_chain_hash:
            "96b9c38c4c2a0a3b84742b42b0b4d879de0799d77301df36f72fc1556b560bf9",
          executable_hash:
            "96b9c38c4c2a0a3b84742b42b0b4d879de0799d77301df36f72fc1556b560bf9",
          repo_url:
            "https://github.com/0xobedient/solana-program-verifier-test/tree/a508ea5427072dfd87c374b0c9054a3b45d56dda",
        },
        explanation:
          "solana verified program job status is successfully fetched",
      },
    ],
  ],
  schema: z.object({
    job_id: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { job_id } = input;
      const data = await get_verification_job_status({ job_id });

      return {
        status: "success",
        data,
        message:
          "Solana program verification job status is successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get verification job status ${error.message}`,
        code: error.code || "OTTERSEC_GET_VERIFICATION_JOB_STATUS_FAILED",
      };
    }
  },
};

export default getVerificationJobStatus;
