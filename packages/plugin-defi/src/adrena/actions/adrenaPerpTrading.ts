import { Action } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import {
  openPerpTradeLong,
  openPerpTradeShort,
  closePerpTradeLong,
  closePerpTradeShort,
} from "../tools";

const openPerpTradeLongAction: Action = {
  name: "OPEN_PERP_TRADE_LONG",
  similes: [
    "open long position",
    "long trade",
    "create long position",
    "open long perp",
    "long perp trade",
    "leverage long",
  ],
  description: "Open a long perpetual trading position on Adrena with leverage",
  examples: [
    [
      {
        input: {
          price: 25000,
          collateralAmount: 1000,
          leverage: 2000, // 2x leverage = 2000 bps
          tradeMint: "So11111111111111111111111111111111111111112", // SOL
          slippage: 0.3,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message:
            "Successfully opened 2x long SOL position with 1000 USDC collateral",
        },
        explanation:
          "Open a 2x leveraged long position on SOL using 1000 USDC as collateral",
      },
    ],
  ],
  schema: z.object({
    price: z.number().positive().describe("Current price of the asset"),
    collateralAmount: z
      .number()
      .positive()
      .describe("Amount of collateral to use"),
    leverage: z
      .number()
      .positive()
      .default(2000)
      .describe("Leverage in basis points (2000 = 2x)"),
    tradeMint: z.string().describe("Mint address of the token to trade"),
    slippage: z
      .number()
      .positive()
      .default(0.3)
      .describe("Slippage tolerance in percentage"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await openPerpTradeLong({
        agent,
        price: input.price,
        collateralAmount: input.collateralAmount,
        leverage: input.leverage,
        tradeMint: new PublicKey(input.tradeMint),
        slippage: input.slippage,
      });

      return {
        status: "success",
        transaction: tx,
        message: `Successfully opened ${input.leverage / 1000}x long position with ${input.collateralAmount} collateral`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

const openPerpTradeShortAction: Action = {
  name: "OPEN_PERP_TRADE_SHORT",
  similes: [
    "open short position",
    "short trade",
    "create short position",
    "open short perp",
    "short perp trade",
    "leverage short",
  ],
  description:
    "Open a short perpetual trading position on Adrena with leverage",
  examples: [
    [
      {
        input: {
          price: 25000,
          collateralAmount: 1000,
          leverage: 2000,
          tradeMint: "So11111111111111111111111111111111111111112",
          slippage: 0.3,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message:
            "Successfully opened 2x short SOL position with 1000 USDC collateral",
        },
        explanation:
          "Open a 2x leveraged short position on SOL using 1000 USDC as collateral",
      },
    ],
  ],
  schema: z.object({
    price: z.number().positive().describe("Current price of the asset"),
    collateralAmount: z
      .number()
      .positive()
      .describe("Amount of collateral to use"),
    leverage: z
      .number()
      .positive()
      .default(2000)
      .describe("Leverage in basis points (2000 = 2x)"),
    tradeMint: z.string().describe("Mint address of the token to trade"),
    slippage: z
      .number()
      .positive()
      .default(0.3)
      .describe("Slippage tolerance in percentage"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await openPerpTradeShort({
        agent,
        price: input.price,
        collateralAmount: input.collateralAmount,
        leverage: input.leverage,
        tradeMint: new PublicKey(input.tradeMint),
        slippage: input.slippage,
      });

      return {
        status: "success",
        signature: tx,
        message: `Successfully opened ${input.leverage / 1000}x short position with ${input.collateralAmount} collateral`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

const closePerpTradeLongAction: Action = {
  name: "CLOSE_PERP_TRADE_LONG",
  similes: [
    "close long position",
    "exit long trade",
    "close long perp",
    "exit long position",
    "close leveraged long",
  ],
  description: "Close an existing long perpetual trading position on Adrena",
  examples: [
    [
      {
        input: {
          price: 26000,
          tradeMint: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully closed long SOL position",
        },
        explanation: "Close an existing long SOL position",
      },
    ],
  ],
  schema: z.object({
    price: z.number().positive().describe("Current price of the asset"),
    tradeMint: z
      .string()
      .describe("Mint address of the token position to close"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await closePerpTradeLong({
        agent,
        price: input.price,
        tradeMint: new PublicKey(input.tradeMint),
      });

      return {
        status: "success",
        signature: tx,
        message: "Successfully closed long position",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

const closePerpTradeShortAction: Action = {
  name: "CLOSE_PERP_TRADE_SHORT",
  similes: [
    "close short position",
    "exit short trade",
    "close short perp",
    "exit short position",
    "close leveraged short",
  ],
  description: "Close an existing short perpetual trading position on Adrena",
  examples: [
    [
      {
        input: {
          price: 24000,
          tradeMint: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully closed short SOL position",
        },
        explanation: "Close an existing short SOL position",
      },
    ],
  ],
  schema: z.object({
    price: z.number().positive().describe("Current price of the asset"),
    tradeMint: z
      .string()
      .describe("Mint address of the token position to close"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await closePerpTradeShort({
        agent,
        price: input.price,
        tradeMint: new PublicKey(input.tradeMint),
      });

      return {
        status: "success",
        signature: tx,
        message: "Successfully closed short position",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export {
  openPerpTradeLongAction,
  openPerpTradeShortAction,
  closePerpTradeLongAction,
  closePerpTradeShortAction,
};
