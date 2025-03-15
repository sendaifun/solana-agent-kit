import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getLimitOrderHistory } from "../../tools/jupiter/get_limit_order_history";

const getLimitOrderHistoryAction: Action = {
  name: "GET_LIMIT_ORDER_HISTORY",
  similes: [
    "fetch order history",
    "get limit order history",
    "retrieve order history",
    "get past orders",
  ],
  description: "Fetches the limit order history for a given wallet.",
  examples: [
    [
      {
        input: {
          walletPublicKey: "CmwPTro4ogHPhuG9Dozx1X7KiATNudF1rkem3BQmuPn7",
          page: 1,
        },
        output: {
          history: {
            orders: [
              {
                userPubkey: "CmwPTro4ogHPhuG9Dozx1X7KiATNudF1rkem3BQmuPn7",
                orderKey: "GgMvwcfMzP9AmfwZuMzNienXGBhQa8dksihZvTmyBZYM",
                inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                outputMint: "So11111111111111111111111111111111111111112",
                makingAmount: "10000000",
                takingAmount: "50000000",
                remainingMakingAmount: "50000000",
                remainingTakingAmount: "10000000",
                expiredAt: null,
                createdAt: "2023-10-01T00:00:00Z",
                updatedAt: "2023-10-02T00:00:00Z",
                status: "Open",
                openTx:
                  "https://solscan.io/tx/2431GhdanFFwWg...77BBCSk34SW2iFHwu17zQARjr",
                closeTx: "",
                programVersion: "1.0",
                trades: [
                  {
                    amount: "10000000",
                    price: "50000000",
                    timestamp: "2023-10-01T01:00:00Z",
                  },
                ],
              },
            ],
            hasMoreData: false,
            page: 1,
          },
          success: true,
        },
        explanation: "Successfully fetched order history for the given wallet.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    try {
      const history = await getLimitOrderHistory(agent);
      return {
        status: "success",
        result: { history, success: true },
        message: "Successfully fetched order history for the given wallet.",
      };
    } catch (error) {
      const errorMessage = `Error fetching order history: ${error}`;
      console.error(errorMessage);
      return {
        status: "error",
        message: errorMessage,
        result: { history: [], success: false },
      };
    }
  },
};

export default getLimitOrderHistoryAction;
