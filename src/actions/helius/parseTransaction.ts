import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { parseTransaction } from "../../tools/helius";

const parseSolanaTransactionAction: Action = {
  name: "PARSE_SOLANA_TRANSACTION",
  similes: [
    "parse transaction",
    "analyze transaction",
    "inspect transaction",
    "decode transaction",
  ],
  description:
    "Parse a Solana transaction to retrieve detailed information using the Helius Enhanced Transactions API",
  examples: [
    [
      {
        input: {
          transactionId:
            "4zZVvbgzcriyjAeEiK1w7CeDCt7gYThUCZat3ULTNerzKHF4WLfRG2YUjbRovfFJ639TAyARB4oyRDcLVUvrakq7",
        },
        output: {
          status: "success",
          transaction: {
            details: "Transaction details...",
            involvedAccounts: ["Account1", "Account2"],
            executedOperations: [{ operation: "Transfer", amount: "1000 SOL" }],
          },
          message:
            "Successfully parsed transaction: 4zZVvbgzcriyjAeEiK1w7CeDCt7gYThUCZat3ULTNerzKHF4WLfRG2YUjbRovfFJ639TAyARB4oyRDcLVUvrakq7",
        },
        explanation:
          "Parse a Transaction to transform it into human readable format.",
      },
    ],
  ],
  schema: z.object({
    transactionId: z
      .string()
      .min(1)
      .describe("The Solana transaction ID to parse"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const parsedTransactionData = await parseTransaction(
        agent,
        input.transactionId,
      );

      return {
        status: "success",
        transaction: parsedTransactionData,
        message: `Successfully parsed transaction: ${input.transactionId}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to parse transaction: ${error.message}`,
      };
    }
  },
};

export default parseSolanaTransactionAction;
