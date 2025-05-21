import { Action, SolanaAgentKit } from "solana-agent-kit";
import { getChainData } from "../tools/get_chain_data";
import { z } from "zod";

const getChainDataAction: Action = {
  name: "OKX_GET_CHAIN_DATA",
  description: "Get Chain data from okx dex",
  similes: [
    "get chain data from okx dex",
    "fetch chain data from okx dex",
    "get chain information from okx",
    "fetch chain information from okx",
    "get chain from okx dex",
    "fetch chain from okx dex",
  ],
  examples: [
    [
      {
        input: {
          chainId: "501", // Solana
        },
        output: {
          chainId: 501,
          chainIndex: 501,
          chainName: "Solana",
          dexTokenApproveAddress: "",
        },
        explanation: "get chain data from okx dex",
      },
    ],
  ],
  schema: z.object({
    chainId: z.string().describe("Unique identifier for the chain"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { chainId } = input;

      const tokens = await getChainData(agent, chainId);

      return {
        status: "success",
        message: "Successfully fetch chain data",
        tokens,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get chain data from okx ${error.message}`,
        code: error.code || "OKX_GET_CHAIN_DATA",
      };
    }
  },
};

export default getChainDataAction;
