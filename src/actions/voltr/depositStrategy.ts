import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

const depositVoltrStrategyAction: Action = {
  name: "DEPOSIT_VOLTR_STRATEGY",
  similes: [
    "deposit to voltr strategy",
    "add funds to voltr vault strategy",
    "invest in voltr strategy",
    "deposit assets to voltr",
    "contribute to voltr vault",
    "fund voltr strategy",
  ],
  description: "Deposit assets into a specific strategy within a Voltr vault",
  examples: [
    [
      {
        input: {
          depositAmount: "1000000000", // 1 USDC with 6 decimals
          vault: "7opUkqYtxmQRriZvwZkPcg6LqmGjAh1RSEsVrdsGDx5K",
          strategy: "9ZQQYvr4x7AMqd6abVa1f5duGjti5wk1MHsX6hogPsLk",
        },
        output: {
          status: "success",
          vault: "7opUkqYtxmQRriZvwZkPcg6LqmGjAh1RSEsVrdsGDx5K",
          strategy: "9ZQQYvr4x7AMqd6abVa1f5duGjti5wk1MHsX6hogPsLk",
          signature: "2ZE7Rz...",
          message: "Successfully deposited 1000000000 into strategy",
        },
        explanation: "Deposit 1 USDC into a Voltr vault strategy",
      },
    ],
  ],
  schema: z.object({
    depositAmount: z
      .string()
      .min(1)
      .describe("The amount to deposit (in base units including decimals)"),
    vault: z
      .string()
      .min(1)
      .describe(
        "The public key of the Voltr source vault to take assets from, e.g., 'Ga27...'",
      ),
    strategy: z
      .string()
      .min(1)
      .describe(
        "The public key of the initialized target strategy to deposit into, e.g., 'Jheh...'",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const depositAmount = new BN(input.depositAmount);
      const vault = new PublicKey(input.vault);
      const strategy = new PublicKey(input.strategy);

      const signature = await agent.voltrDepositStrategy(
        depositAmount,
        vault,
        strategy,
      );

      return {
        status: "success",
        vault: vault.toBase58(),
        strategy: strategy.toBase58(),
        signature,
        message: `Successfully deposited ${input.depositAmount} into strategy`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to deposit into strategy: ${error.message}`,
      };
    }
  },
};

export default depositVoltrStrategyAction;
