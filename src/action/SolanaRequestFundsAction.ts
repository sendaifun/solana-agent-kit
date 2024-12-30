import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaRequestFundsAction: Action = {
  name: "solana_request_funds",
  similes: ["request_airdrop", "get_test_tokens"],
  description: "Request SOL from Solana faucet (devnet/testnet only)",
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                amount: 1,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, _input: Record<string, any>) => {
    await agent.requestFaucetFunds();
    return {
      success: true,
      data: {
        message: "Successfully requested faucet funds",
        network: agent.connection.rpcEndpoint.split("/")[2],
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        amount: z.number(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
