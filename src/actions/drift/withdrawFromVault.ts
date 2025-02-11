import { z } from "zod";
import type { Action } from "../../types";
import type { SolanaAgentKit } from "../../agent";
import { withdrawFromDriftVault } from "../../tools";

const withdrawFromVaultAction: Action = {
  name: "WITHDRAW_FROM_DRIFT_VAULT",
  description:
    "Withdraw funds from a vault given the redemption time has elapsed.",
  similes: ["withdraw from drift vault", "redeem funds from vault"],
  examples: [
    [
      {
        input: {
          vaultAddress: "2nFeP7taii",
        },
        output: {
          status: "success",
          message: "Withdrawal successful",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Withdraw funds from a drift vault",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string().describe("Vault's address"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const tx = await withdrawFromDriftVault(
        agent,
        input.vaultAddress as string,
      );

      return {
        status: "success",
        message: "Withdrawal successful",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to withdraw funds: ${e.message}`,
      };
    }
  },
};

export default withdrawFromVaultAction;
