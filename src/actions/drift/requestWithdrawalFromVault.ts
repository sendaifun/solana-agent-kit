import { z } from "zod";
import type { Action } from "../../types";
import type { SolanaAgentKit } from "../../agent";
import { requestWithdrawalFromVault } from "../../tools";

const requestWithdrawalFromVaultAction: Action = {
  name: "REQUEST_WITHDRAWAL_FROM_DRIFT_VAULT",
  description: "Request a withdrawal from an existing drift vault",
  similes: ["withdraw from drift vault", "request withdrawal from vault"],
  examples: [
    [
      {
        input: {
          amount: 100,
          vaultAddress: "2nFeP7taii",
        },
        output: {
          status: "success",
          message: "Withdrawal request successful",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Request a withdrawal of 100 USDC from a drift vault",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string(),
    amount: z
      .number()
      .positive()
      .describe(
        "Amount of shares you would like to withdraw from the vault in normal token amounts e.g 50 SOL, 100 USDC, etc",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const tx = await requestWithdrawalFromVault(
        agent,
        input.amount as number,
        input.vaultAddress as string,
      );

      return {
        status: "success",
        message: "Withdrawal request successful",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to request withdrawal: ${e.message}`,
      };
    }
  },
};

export default requestWithdrawalFromVaultAction;
