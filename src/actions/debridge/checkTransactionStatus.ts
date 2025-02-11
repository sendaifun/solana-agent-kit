import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { checkDebridgeTransactionStatus } from "../../tools/debridge";

const checkDebridgeTransactionStatusAction: Action = {
  name: "DEBRIDGE_CHECK_TRANSACTION_STATUS",
  similes: [
    "check bridge status",
    "check debridge transaction",
    "get bridge status",
    "bridge transaction status",
  ],
  description:
    "Check the status of a cross-chain bridge transaction on deBridge",
  examples: [
    [
      {
        input: {
          txHash:
            "5v6Jx3qHsNaQvPe1Cs3AooAiY2ZnutxQHNJrHw9SwJzAeaDXMaD2JYGE579CFk88jMFw4YiKqmLUc6QCAwvhjKQX",
        },
        output: {
          status: "success",
          message: "Bridge transaction status retrieved successfully",
          transaction: {
            hash: "5v6Jx3qHsNaQvPe1Cs3AooAiY2ZnutxQHNJrHw9SwJzAeaDXMaD2JYGE579CFk88jMFw4YiKqmLUc6QCAwvhjKQX",
            explorerUrl:
              "https://explorer.solana.com/tx/5v6Jx3qHsNaQvPe1Cs3AooAiY2ZnutxQHNJrHw9SwJzAeaDXMaD2JYGE579CFk88jMFw4YiKqmLUc6QCAwvhjKQX",
          },
          orders: [
            {
              status: "completed",
              srcChainTxHash:
                "5v6Jx3qHsNaQvPe1Cs3AooAiY2ZnutxQHNJrHw9SwJzAeaDXMaD2JYGE579CFk88jMFw4YiKqmLUc6QCAwvhjKQX",
              dstChainTxHash: "0x1234567890abcdef",
              orderLink:
                "https://app.debridge.finance/order?orderId=0x9876543210",
            },
          ],
        },
        explanation:
          "Check the status of a bridge transaction from Solana to Ethereum",
      },
    ],
  ],
  schema: z.object({
    txHash: z.string().describe("Transaction hash to check status for"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const orders = await checkDebridgeTransactionStatus(agent, input.txHash);

      return {
        status: "success",
        message: "Bridge transaction status retrieved successfully",
        transaction: {
          hash: input.txHash,
          explorerUrl: `https://explorer.solana.com/tx/${input.txHash}`,
        },
        orders,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default checkDebridgeTransactionStatusAction;
