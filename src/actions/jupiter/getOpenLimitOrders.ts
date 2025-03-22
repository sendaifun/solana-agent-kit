import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { getOpenLimitOrders } from "../../tools/jupiter/get_open_limit_orders";
import { z } from "zod";

const getOpenLimitOrdersAction: Action = {
  name: "GET_OPEN_LIMIT_ORDERS",
  similes: ["fetch open orders", "get limit orders", "retrieve open orders"],
  description: "Fetches the open limit orders for a given wallet.",
  examples: [
    [
      {
        input: {
          walletPublicKey: "CmwPTro4ogHP...muPn7",
        },
        output: {
          orders: [
            {
              userPubkey: "CmwPTro4ogHP...muPn7",
              orderKey: "GgMvwcfM...vTmyBZYM",
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
          success: true,
        },
        explanation: "Successfully fetched open orders for the given wallet.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    try {
      const orders = await getOpenLimitOrders(agent);
      return {
        status: "success",
        result: { orders, success: true },
        message: "Successfully fetched open orders for the given wallet.",
      };
    } catch (error) {
      const errorMessage = `Error fetching open orders: ${error}`;
      console.error(errorMessage);
      return {
        status: "error",
        message: errorMessage,
        result: { orders: [], success: false },
      };
    }
  },
};

export default getOpenLimitOrdersAction;
