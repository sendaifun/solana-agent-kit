import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getPolicy } from "../tools";

const getPolicyAction: Action = {
  name: "ONLEASH_GET_POLICY",
  similes: [
    "get transfer policy",
    "check spending limits",
    "read onleash policy",
    "check daily cap",
    "how much has the agent spent today",
  ],
  description:
    "Fetch the on-chain Onleash policy for a protected mint. Shows current caps, " +
    "the destination allowlist, and how much has been spent today.",
  examples: [
    [
      {
        input: {
          mint: "2KkYRVS2cBnneryveAYxH5hGfnNhdFruXAc4NjeAekcZ",
        },
        output: {
          status: "success",
          perTxMax: "10000000",
          dailyCap: "50000000",
          spentToday: "5000000",
          destinationAllowlist: ["8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk"],
        },
        explanation: "Read the policy for a protected mint.",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe("The protected mint address to query."),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const policy = await getPolicy(agent, input.mint);
    if (!policy) {
      return { status: "error", message: `No Onleash policy found for mint ${input.mint}. Has init_policy been called?` };
    }
    return { status: "success", ...policy };
  },
};

export default getPolicyAction;
