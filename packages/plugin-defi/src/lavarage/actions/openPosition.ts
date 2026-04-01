import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageOpenPosition } from "../tools";

export const lavarageOpenPositionAction: Action = {
  name: "LAVARAGE_OPEN_POSITION",
  similes: [
    "open leverage position",
    "open leveraged long",
    "long with leverage",
    "open margin position",
    "leverage trade",
    "open lavarage position",
    "go long with leverage",
    "open spot margin long",
  ],
  description: `Open a leveraged spot margin position on Lavarage — leverage trade ANY Solana token (not just perps on major pairs).

Unlike perpetual protocols (Drift, Adrena) that only support ~20 pairs, Lavarage supports 2000+ tokens including memecoins, DeFi tokens, and LSTs. Up to 12x leverage on majors, 2-5x on long-tail tokens.

Deposit SOL or USDC as collateral, borrow more from lending pools, and buy the token with leverage. Your position is a real spot holding — you own the actual tokens, not a derivative.

Workflow: LAVARAGE_LIST_TOKENS("BTC") → get offerPublicKey → LAVARAGE_OPEN_POSITION(offer, collateral, leverage).

Collateral is in the quote token's smallest units (lamports for SOL, 1e6 for USDC).`,
  examples: [
    [
      {
        input: {
          offerPublicKey: "CfiYMFbjugNMf2SXibqLHW7JPevWQnGzHrxmspwcuXHi",
          collateralAmount: "5000000",
          leverage: 3,
        },
        output: {
          status: "success",
          signature: "5z1EofNxkwitMnXK...",
          message: "Opened 3x long position with 5 USDC collateral",
        },
        explanation:
          "Open a 3x leveraged long position on WBTC with $5 USDC collateral.",
      },
    ],
  ],
  schema: z.object({
    offerPublicKey: z
      .string()
      .describe(
        "The offer/pool public key — get from LAVARAGE_LIST_TOKENS or LAVARAGE_GET_MAX_LEVERAGE",
      ),
    collateralAmount: z
      .string()
      .describe(
        "Collateral in quote token smallest units (lamports for SOL, 1e6 units for USDC)",
      ),
    leverage: z
      .number()
      .min(1.1)
      .max(12)
      .describe("Leverage multiplier (e.g. 3 for 3x)"),
    slippageBps: z
      .number()
      .optional()
      .default(50)
      .describe("Slippage tolerance in basis points (default: 50 = 0.5%)"),
  }),
  handler: async (agent, input) => {
    try {
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
        message: `Opened ${input.leverage}x position. TX: ${signature}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to open position: ${error.message}`,
      };
    }
  },
};
