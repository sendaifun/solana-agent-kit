import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";
import type { Action } from "../../types";
import { depositToDriftUserAccount } from "../../tools";

const depositToDriftUserAccountAction: Action = {
  name: "DEPOSIT_TO_DRIFT_USER_ACCOUNT",
  description: "Deposit funds into your drift user account",
  similes: [
    "deposit into drift user account",
    "add funds to drift user account",
    "add funds to my drift account",
    "deposit collateral into drift account",
  ],
  examples: [
    [
      {
        input: {
          amount: 100,
          symbol: "usdc",
        },
        output: {
          status: "success",
          message: "Funds deposited successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Deposit 100 USDC into your drift user account",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .number()
      .positive()
      .describe(
        "The amount in tokens you'd like to deposit into your drift user account",
      ),
    symbol: z
      .string()
      .toUpperCase()
      .describe("The symbol of the token you'd like to deposit"),
    repay: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether or not to repay the borrowed funds in the account"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const tx = await depositToDriftUserAccount(
        agent,
        input.amount as number,
        input.symbol as string,
        input.repay as boolean,
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

export default depositToDriftUserAccountAction;
