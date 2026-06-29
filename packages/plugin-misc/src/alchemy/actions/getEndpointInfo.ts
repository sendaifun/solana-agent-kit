import { z } from "zod";
import { getAlchemySolanaEndpointInfo } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyGetEndpointInfoAction: Action = {
  name: "ALCHEMY_GET_SOLANA_ENDPOINT_INFO",
  similes: [
    "alchemy solana endpoints",
    "alchemy rpc url",
    "alchemy websocket url",
    "alchemy grpc url",
    "alchemy x402 solana endpoint",
  ],
  description:
    "Returns Alchemy Solana RPC, WebSocket, Yellowstone gRPC, and x402 reference endpoint templates without exposing secrets",
  examples: [
    [
      {
        input: {
          network: "solana-mainnet",
        },
        output: {
          status: "success",
          endpoints: {
            network: "solana-mainnet",
            rpcUrl: "https://solana-mainnet.g.alchemy.com/v2/<ALCHEMY_API_KEY>",
            websocketUrl:
              "wss://solana-mainnet.g.alchemy.com/v2/<ALCHEMY_API_KEY>",
            grpcUrl: "https://solana-mainnet.g.alchemy.com",
            grpcAuthHeader: "X-Token",
            x402RpcUrl: "https://x402.alchemy.com/solana-mainnet/v2",
            x402PaymentFlow:
              "Requires the full wallet-based x402 payment flow; this plugin does not authenticate x402 requests with a static token.",
          },
          message: "Alchemy Solana endpoint templates retrieved.",
        },
        explanation:
          "Shows the endpoint templates to use for Alchemy Solana RPC, WebSocket, gRPC, and x402 wallet-payment flows.",
      },
    ],
  ],
  schema: z.object({
    network: z
      .string()
      .optional()
      .describe(
        "Alchemy Solana network, such as solana-mainnet or solana-devnet",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    return {
      status: "success",
      endpoints: getAlchemySolanaEndpointInfo(agent, {
        network: input.network,
      }),
      message: "Alchemy Solana endpoint templates retrieved.",
    };
  },
};

export default alchemyGetEndpointInfoAction;
