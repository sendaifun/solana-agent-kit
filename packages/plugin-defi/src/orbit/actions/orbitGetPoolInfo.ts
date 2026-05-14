import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { orbitGetPoolInfo } from "../tools";

const orbitGetPoolInfoAction: Action = {
  name: "ORBIT_GET_POOL_INFO",
  description:
    "Get full metadata for an Orbit Finance DLMM pool: TVL, 24h volume, reserves, fee tier, bin step, and token details",
  similes: [
    "orbit pool info",
    "orbit pool details",
    "orbit pool metadata",
    "orbit dlmm pool info",
    "orbit finance pool",
  ],
  examples: [
    [
      {
        input: {
          poolId: "EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB",
        },
        output: {
          status: "success",
          data: {},
          message: "Successfully fetched Orbit pool info",
        },
        explanation: "Get full pool metadata for the CIPHER/USDC Orbit DLMM pool",
      },
    ],
  ],
  schema: z.object({
    poolId: z.string().min(1).describe("Pool public key (base58)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await orbitGetPoolInfo(agent, input.poolId as string);
      return {
        status: "success",
        data: JSON.parse(result),
        message: "Successfully fetched Orbit pool info",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default orbitGetPoolInfoAction;
