import { PublicKey } from "@solana/web3.js";
import type { Action } from "../types/action";
import type { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { get_token_balance } from "../tools";

const tokenBalancesAction: Action = {
  name: "TOKEN_BALANCE_ACTION",
  similes: [
    "check token balances",
    "get wallet token balances",
    "view token balances",
    "show token balances",
    "check token balance",
  ],
  description: `Get the token balances of a Solana wallet.
  If you want to get the balance of your wallet, you don't need to provide the wallet address.`,
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          balance: {
            sol: 100,
            tokens: [
              {
                tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                name: "USD Coin",
                symbol: "USDC",
                balance: 100,
                decimals: 9,
              },
            ],
          },
        },
        explanation: "Get token balances of the wallet",
      },
    ],
    [
      {
        input: {
          walletAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          balance: {
            sol: 100,
            tokens: [
              {
                tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                name: "USD Coin",
                symbol: "USDC",
                balance: 100,
                decimals: 9,
              },
            ],
          },
        },
        explanation: "Get address token balance",
      },
    ],
  ],
  schema: z.object({
    walletAddress: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    const balance = await get_token_balance(
      agent,
      input.tokenAddress && new PublicKey(input.tokenAddress),
    );

    return {
      status: "success",
      balance: balance,
    };
  },
};

export default tokenBalancesAction;
