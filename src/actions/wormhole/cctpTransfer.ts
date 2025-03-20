import { z } from "zod";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { CctpTransferInput } from "../../types";
export const cctpTransferAction: Action = {
  name: "CCTP_TRANSFER",
  description: `Transfer a token from solana  to another supported chain using CCTP
  
  
    `,
  similes: [
    "transfer token",
    "transfer usdc",
    "transfer usdt",
    "transfer usdc to ethereum",
    "transfer usdc to base on testnet",
    "transfer usdc to base sepolia",
    "transfer usdc to base mainnet",
    "transfer usdc to avalanche",
    "transfer usdc to avalanche testnet",
    "transfer usdc to avalanche mainnet",
    "transfer usdc to polygon",
    "transfer usdc to polygon testnet",
    "transfer usdc to polygon mainnet",
    "transfer usdc to sui",
  ],
  examples: [
    [
      {
        input: {
          destinationChain: "Base Sepolia",
          transferAmount: "1",
          network: "Testnet",
        },
        output: {
          status: "success",
          message: "USDC transferred successfully",
        },
        explanation: "Transfer USDC from Solana to Base Sepolia",
      },
    ],
  ],
  schema: z.object({
    destinationChain: z
      .string()
      .describe("The destination chain to transfer the token to"),
    transferAmount: z.string().describe("The amount of tokens to transfer"),
    network: z
      .string()
      .optional()
      .describe("The network to use for the transfer"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const response = await agent.cctpTransfer(input as CctpTransferInput);
    return response;
  },
};

export default cctpTransferAction;
