import { SolanaAgentKit } from "../../agent";
import { TokenTransferInput } from "../../types";
import { z } from "zod";
import { Action } from "../../types/action";

export const tokenTransferAction: Action = {
  name: "token_transfer",
  description: "Transfer a token from Solana to another chain",

  similes: [
    "transfer token",
    "transfer 0.1 sol to BaseSepolia",
    "transfer 0.1 sol to BaseMainnet",

    "transfer 0.1 sol to Avalanche Mainnet",
  ],
  examples: [
    [
      {
        input: {
          destinationChain: "BaseSepolia",
          transferAmount: "0.1",
          network: "Testnet",
        },
        output: {
          status: "success",
          message: "Token transferred successfully",
        },
        explanation: "Transfer 0.1 sol to BaseSepolia",
      },
    ],
  ],

  schema: z.object({
    destinationChain: z
      .string()
      .describe("The destination chain to transfer the token to"),
    network: z
      .string()
      .optional()
      .describe("The network to use for the transfer"),
    transferAmount: z.string().describe("The amount of tokens to transfer"),
    tokenAddress: z
      .string()
      .optional()
      .describe(
        "The address of the token to transfer, in case of solana, it is empty",
      ),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await agent.tokenTransfer(input as TokenTransferInput);
    return result;
  },
};

export default tokenTransferAction;
