import { SolanaAgentKit } from "../../agent";
import { CreateWrappedTokenInput } from "../../types";
import { z } from "zod";
import { Action } from "../../types/action";

export const createWrappedTokenAction: Action = {
  name: "create_wrapped_token",
  description:
    "Create a wrapped token on a destination chain for a token from Solana",

  similes: [
    "create wrapped token",
    "wrap token on another chain",
    "create wrapped USDC on Ethereum",
    "attest token to another chain",
  ],
  examples: [
    [
      {
        input: {
          destinationChain: "BaseSepolia",
          tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          network: "Testnet",
        },
        output: {
          success: true,
          wrappedToken: {
            chain: "BaseSepolia",
            address: "0x1234567890abcdef1234567890abcdef12345678",
          },
          attestationTxid:
            "5UYkBtRBMY92juhxH5ZbjitVsEaJwBXyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        },
        explanation: "Create a wrapped USDC token on BaseSepolia testnet",
      },
    ],
  ],

  schema: z.object({
    destinationChain: z
      .string()
      .describe("The destination chain to create the wrapped token on"),
    tokenAddress: z.string().describe("The address of the token to wrap"),
    network: z
      .string()
      .optional()
      .describe("The network to use for the wrapped token"),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await agent.createWrappedToken(
      input as CreateWrappedTokenInput,
    );
    return result;
  },
};

export default createWrappedTokenAction;
