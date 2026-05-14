import { z } from "zod";
import { alchemySolanaRpcRequest } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemySolanaRpcRequestAction: Action = {
  name: "ALCHEMY_SOLANA_RPC_REQUEST",
  similes: [
    "alchemy solana rpc",
    "call alchemy solana",
    "solana rpc via alchemy",
    "alchemy json rpc",
  ],
  description:
    "Calls a Solana JSON-RPC method through Alchemy using ALCHEMY_API_KEY",
  examples: [
    [
      {
        input: {
          method: "getHealth",
          params: [],
        },
        output: {
          status: "success",
          result: "ok",
          message: "Alchemy Solana RPC request completed.",
        },
        explanation:
          "Calls the getHealth Solana JSON-RPC method through Alchemy.",
      },
    ],
  ],
  schema: z.object({
    method: z.string().min(1).describe("Solana JSON-RPC method name"),
    params: z
      .union([z.array(z.any()), z.record(z.any())])
      .optional()
      .describe("JSON-RPC params for the Solana method"),
    network: z
      .string()
      .optional()
      .describe(
        "Alchemy Solana network, such as solana-mainnet or solana-devnet",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await alchemySolanaRpcRequest(
        agent,
        input.method,
        input.params ?? [],
        { network: input.network },
      );

      return {
        status: "success",
        result,
        message: "Alchemy Solana RPC request completed.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Alchemy Solana RPC request failed: ${error.message}`,
      };
    }
  },
};

export default alchemySolanaRpcRequestAction;
