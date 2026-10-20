import { type Action, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { pumpDataResultFields, pumpdataGetWallets } from "../tools";

const base58Address = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "must be a base58 address");

const pumpdataGetWalletsAction: Action = {
  name: "PUMPDATA_GET_WALLETS",
  similes: [
    "pump.fun wallet history",
    "what have these buyers done",
    "check pump.fun buyers",
    "wallet pnl on pump.fun",
    "pumpdata wallets",
  ],
  description:
    "Costs $0.01 in USDC per call (up to 50 wallets), paid over x402 from the agent's wallet. What each wallet has done on pump.fun over the whole history, keyed by address: class, pnl_sol, put_in, took_out, coins and first_seen. The class is a rule, not a judgement: winner took out more than it put in over 20+ coin-weeks; bot trades a coin 20+ times a week or 500+ coins; supply_seller took out 1.5x what it put in, 100 SOL or more; new has no record before the given mint (or before today); none fits no rule. Report the class with the SOL behind it.",
  examples: [
    [
      {
        input: {
          addresses: [
            "7ufmve7ZSFCzuNcKRunYrGtyb2Ka1MXzkWwf7jZhVsmL",
            "48Wd6T22ykm6UHbdH4chq1hy1etdfpYYvVujCgL7AgPA",
          ],
          mint: "D27Lb9LA6D4dFpogGoXMXvZYkRsZ7UuctxAFpFQ3pump",
        },
        output: {
          status: "success",
          data: {
            "7ufmve7ZSFCzuNcKRunYrGtyb2Ka1MXzkWwf7jZhVsmL": {
              class: "winner",
              pnl_sol: 41.2,
              put_in: 120.5,
              took_out: 161.7,
              coins: 212,
              first_seen: "2025-04-02T11:08:00Z",
            },
            "48Wd6T22ykm6UHbdH4chq1hy1etdfpYYvVujCgL7AgPA": {
              class: "new",
              pnl_sol: 0,
              put_in: 0,
              took_out: 0,
              coins: 0,
              first_seen: null,
            },
          },
          paidUsd: 0.01,
        },
        explanation: "The records of two buyers of a coin",
      },
    ],
  ],
  schema: z.object({
    addresses: z
      .array(base58Address)
      .min(1)
      .max(50)
      .describe("1 to 50 Solana wallet addresses"),
    mint: base58Address
      .optional()
      .describe(
        "Optional coin these wallets are buying; with it, new means no record before the coin was created",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await pumpdataGetWallets(
        agent,
        input.addresses,
        input.mint,
      );
      return {
        status: "success",
        ...pumpDataResultFields(response),
        message: `pumpdata.fun records for ${input.addresses.length} wallet(s) fetched.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch pumpdata.fun wallet records: ${error.message}`,
      };
    }
  },
};

export default pumpdataGetWalletsAction;
