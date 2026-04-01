import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageOpenPosition } from "../tools";

export const lavarageBorrowAction: Action = {
  name: "LAVARAGE_BORROW",
  similes: [
    "borrow tokens",
    "borrow against collateral",
    "take a loan",
    "borrow USDC",
    "borrow SOL",
    "get a loan on solana",
    "borrow crypto",
    "lend and borrow",
  ],
  description: `Borrow any Solana token against collateral on Lavarage. No directional bet — just access to liquidity.

Examples:
- "Borrow USDC against my SOL" — keep SOL exposure, get liquid USDC
- "Borrow SOL against USDC" — get SOL without selling USDC
- "Take a 2x loan on my SOL" — borrow equal to your deposit

The leverage parameter controls your loan-to-value:
- 2x = borrow equal to your collateral (50% LTV)
- 3x = borrow 2x your collateral (67% LTV)

Repay anytime with LAVARAGE_REPAY. No fixed term, no lockup.

First call LAVARAGE_LIST_TOKENS to find the borrow offer, then use the offerPublicKey.`,
  examples: [
    [
      {
        input: {
          offerPublicKey: "CfiYMFbjugNMf2SXibqLHW7JPevWQnGzHrxmspwcuXHi",
          collateralAmount: "10000000",
          leverage: 2,
        },
        output: {
          status: "success",
          signature: "2AYJ924L...",
          message: "Borrowed tokens against 10M lamports collateral",
        },
        explanation: "Borrow USDC against 0.01 SOL collateral at 2x (50% LTV).",
      },
    ],
  ],
  schema: z.object({
    offerPublicKey: z
      .string()
      .describe("Borrow offer public key — get from LAVARAGE_LIST_TOKENS"),
    collateralAmount: z
      .string()
      .describe("Collateral in quote token smallest units (lamports for SOL, 1e6 for USDC)"),
    leverage: z
      .number()
      .min(1.1)
      .max(10)
      .describe("Borrow ratio — 2x = borrow equal to collateral, 3x = borrow 2x collateral"),
    slippageBps: z
      .number()
      .optional()
      .default(50)
      .describe("Slippage in bps (default: 50)"),
  }),
  handler: async (agent, input) => {
    try {
      // Borrow uses the same open position flow — the offer type determines it's a borrow
      const signature = await lavarageOpenPosition(
        agent,
        input.offerPublicKey,
        input.collateralAmount,
        input.leverage,
        input.slippageBps,
      );
      return {
        status: "success",
        signature,
        message: `Borrow complete! Tokens in your wallet. TX: ${signature}. Repay with LAVARAGE_REPAY.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Borrow failed: ${error.message}`,
      };
    }
  },
};
