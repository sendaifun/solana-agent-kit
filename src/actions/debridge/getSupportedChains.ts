import { z } from "zod";
import { Action } from "../../types/action";
import { getSupportedChains } from "../../tools/debridge/getSupportedChains";
import { SolanaAgentKit } from "../../agent";

const getSupportedChainsAction: Action = {
  name: "GET_SUPPORTED_CHAINS",
  description: "Fetch the list of supported chains for cross-chain bridging via deBridge",
  similes: [
    "list supported chains for bridging",
    "show available chains for cross-chain transfer",
    "what chains can I bridge between",
    "check if a chain is supported for bridging",
    "get chain IDs for cross-chain transfer"
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          chains: [
            { chainId: "1", chainName: "Ethereum" },
            { chainId: "7565164", chainName: "Solana" },
            { chainId: "56", chainName: "BNB Chain" }
          ],
          message: "Retrieved supported chains successfully"
        },
        explanation: "Get list of all chains supported for cross-chain bridging"
      }
    ]
  ],
  schema: z.object({}),
  handler: async (_agent: SolanaAgentKit, _input: Record<string, any>) => {
    try {
      const response = await getSupportedChains();
      
      return {
        status: "success",
        chains: response.chains.map(chain => ({
          chainId: chain.originalChainId.toString(),
          chainName: chain.chainName,
          internalChainId: chain.chainId
        })),
        message: "Retrieved supported chains successfully"
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch supported chains: ${error.message}`
      };
    }
  }
};

export default getSupportedChainsAction;
