import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { orbitGetPrice } from "../tools";

const orbitGetPriceAction: Action = {
  name: "ORBIT_GET_PRICE",
  description:
    "Get the current USD price, active bin ID, and fee tier for an Orbit Finance DLMM pool",
  similes: [
    "get orbit price",
    "orbit pool price",
    "check orbit pool",
    "orbit dlmm price",
    "orbit finance price",
  ],
  examples: [
    [
      {
        input: {
          poolId: "EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB",
        },
        output: {
          status: "success",
          data: {
            poolId: "EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB",
            priceUsd: 0.0042,
            activeBinId: 8388607,
            binStep: 10,
            feeRateBps: 30,
            tvlUsd: 125000,
            volume24hUsd: 48000,
            tokenX: { mint: "Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N", symbol: "CIPHER", decimals: 9 },
            tokenY: { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", decimals: 6 },
          },
          message: "Successfully fetched Orbit pool price",
        },
        explanation: "Get the current price and metadata for the CIPHER/USDC Orbit DLMM pool",
      },
    ],
  ],
  schema: z.object({
    poolId: z.string().min(1).describe("Pool public key (base58)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await orbitGetPrice(agent, input.poolId as string);
      return {
        status: "success",
        data: JSON.parse(result),
        message: "Successfully fetched Orbit pool price",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default orbitGetPriceAction;
