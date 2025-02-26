import { Action } from "solana-agent-kit";
import { create_TipLink } from "../tools/create_tiplinks";
import { z } from "zod";
import { Transaction } from "@solana/web3.js";

const createTiplinksAction: Action = {
  name: "CREATE_TIPLINKS_ACTION",
  description: "Create a tiplink",
  similes: ["create tiplink", "generate tiplink", "create tip link"],
  examples: [
    [
      {
        input: {
          amount: 1,
        },
        output: {
          url: "https://example.com/tip/1",
          signature: "signature",
        },
        explanation: "Creates a tiplink for 1 SOL tip",
      },
    ],
    [
      {
        input: {
          amount: 1,
          splmintAddress: "splmintAddress",
        },
        output: {
          url: "https://example.com/tip/1",
          signature: "signature",
        },
        explanation: "Creates a tiplink for 1 SPL token tip",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .number()
      .positive()
      .describe("Amount of token user would like to receive using the link"),
    splmintAddress: z
      .string()
      .optional()
      .describe("The mint address of the token the user would like to receive"),
  }),
  handler: async (agent, input) => {
    try {
      const res = await create_TipLink(
        agent,
        input.amount,
        input.splmintAddress,
      );
      return res instanceof Transaction
        ? {
            transaction: res,
          }
        : res;
    } catch (e) {
      // @ts-expect-error - This is a valid error response
      return { status: "error", message: e.message };
    }
  },
};

export default createTiplinksAction;
