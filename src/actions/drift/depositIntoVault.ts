import { z } from "zod";
import type { Action } from "../../types";
import { depositIntoVault } from "../../tools";

const depositIntoDriftVaultAction: Action = {
  name: "DEPOSIT_INTO_DRIFT_VAULT",
  description: "Deposit funds into an existing drift vault",
  similes: ["deposit into drift vault", "add funds to drift vault"],
  examples: [
    [
      {
        input: {
          amount: 100,
          vaultAddress: "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBD",
        },
        output: {
          status: "success",
          message: "Funds deposited successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Deposit 100 USDC into a drift vault",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string(),
    amount: z
      .number()
      .positive()
      .describe(
        "The amount in tokens you'd like to deposit into the vault in normal token amounts e.g 50 SOL, 100 USDC, etc",
      ),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await depositIntoVault(
        agent,
        input.amount as number,
        input.vaultAddress as string,
      );

      return {
        status: "success",
        message: "Funds deposited successfully",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to deposit funds: ${e.message}`,
      };
    }
  },
};

export default depositIntoDriftVaultAction;
