import { z } from "zod";
import type { Action } from "../../types";
import type { SolanaAgentKit } from "../../agent";
import { tradeDriftVault } from "../../tools";

const tradeDelegatedDriftVaultAction: Action = {
  name: "TRADE_DELEGATED_DRIFT_VAULT",
  similes: [
    "trade delegated drift vault",
    "trade delegated vault",
    "trade vault",
    "trade drift vault",
    "trade delegated vault",
    "trade vault",
    "trade drift vault",
    "open drift vault trade",
  ],
  description: "Carry out trades in a Drift vault.",
  examples: [
    [
      {
        input: {
          vaultAddress: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w",
          amount: 100,
          symbol: "SOL",
          action: "buy",
          type: "market",
        },
        output: {
          status: "success",
          message: "Trade successful",
          transactionId: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          amount: 100,
          symbol: "SOL",
          action: "buy",
          type: "market",
        },
        explanation: "Buy 100 SOL in the vault",
      },
    ],
    [
      {
        input: {
          vaultAddress: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w",
          amount: 50,
          symbol: "SOL",
          action: "sell",
          type: "limit",
          price: 200,
        },
        output: {
          status: "success",
          message: "Order placed successful",
          transactionId: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
          amount: 50,
          symbol: "SOL",
          action: "sell",
          type: "limit",
          price: 200,
        },
        explanation: "Sell 50 SOL in the vault at $200",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string().describe("Address of the Drift vault to trade in"),
    amount: z
      .number()
      .positive()
      .describe(
        "Amount to trade in normal token amounts e.g 50 SOL, 100 USDC, etc",
      ),
    symbol: z.string().describe("Symbol of the token to trade"),
    action: z.enum(["long", "short"]).describe("Trade action - long or short"),
    type: z.enum(["market", "limit"]).describe("Trade type - market or limit"),
    price: z
      .number()
      .positive()
      .optional()
      .describe("USD price for limit order"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const params = {
        vaultAddress: input.vaultAddress as string,
        amount: input.amount as number,
        symbol: input.symbol as string,
        action: input.action as "long" | "short",
        type: input.type as "market" | "limit",
        price: input.price as number | undefined,
      };

      // Carry out the trade
      const transactionId = await tradeDriftVault(
        agent,
        params.vaultAddress,
        params.amount,
        params.symbol,
        params.action,
        params.type,
        params.price,
      );

      return {
        status: "success",
        message:
          params.type === "limit"
            ? "Order placed successfully"
            : "Trade successful",
        transactionId,
        ...params,
      };
    } catch (error) {
      return {
        status: "error",
        // @ts-expect-error error is not a string
        message: error.message,
      };
    }
  },
};

export default tradeDelegatedDriftVaultAction;
