import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

const withdrawVoltrStrategyAction: Action = {
  name: "WITHDRAW_VOLTR_STRATEGY",
  similes: [
    "withdraw from voltr strategy",
    "remove funds from voltr vault strategy",
    "take out from voltr strategy",
    "withdraw assets from voltr",
    "pull from voltr vault",
    "redeem from voltr strategy",
  ],
  description: "Withdraw assets from a specific strategy within a Voltr vault",
  examples: [
    [
      {
        input: {
          withdrawAmount: "1000000000", // 1 USDC with 6 decimals
          vault: "7opUkqYtxmQRriZvwZkPcg6LqmGjAh1RSEsVrdsGDx5K",
          strategy: "9ZQQYvr4x7AMqd6abVa1f5duGjti5wk1MHsX6hogPsLk",
        },
        output: {
          status: "success",
          vault: "7opUkqYtxmQRriZvwZkPcg6LqmGjAh1RSEsVrdsGDx5K",
          strategy: "9ZQQYvr4x7AMqd6abVa1f5duGjti5wk1MHsX6hogPsLk",
          signature: "2ZE7Rz...",
          message: "Successfully withdrew 1000000000 from strategy",
        },
        explanation: "Withdraw 1 USDC from a Voltr vault strategy",
      },
    ],
  ],
  schema: z.object({
    withdrawAmount: z
      .string()
      .min(1)
      .describe("The amount to withdraw (in base units including decimals)"),
    vault: z
      .string()
      .min(1)
      .describe(
        "The public key of the Voltr source vault to deposit assets into, e.g., 'Ga27...'",
      ),
    strategy: z
      .string()
      .min(1)
      .describe(
        "The public key of the initialized target strategy to withdraw from, e.g., 'Jheh...'",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const withdrawAmount = new BN(input.withdrawAmount);
      const vault = new PublicKey(input.vault);
      const strategy = new PublicKey(input.strategy);

      const signature = await agent.voltrWithdrawStrategy(
        withdrawAmount,
        vault,
        strategy,
      );

      return {
        status: "success",
        vault: vault.toBase58(),
        strategy: strategy.toBase58(),
        signature,
        message: `Successfully withdrew ${input.withdrawAmount} from strategy`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to withdraw from strategy: ${error.message}`,
      };
    }
  },
};

export default withdrawVoltrStrategyAction;
