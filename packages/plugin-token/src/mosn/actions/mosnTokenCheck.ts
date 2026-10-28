import { Action } from "solana-agent-kit";
import { z } from "zod";
import { fetchMosnTokenCheck } from "../tools";

const mosnTokenCheckAction: Action = {
  name: "MOSN_TOKEN_CHECK",
  description:
    "Check a Solana token for rug-pull and honeypot risk before buying: mint & freeze authority, dangerous Token-2022 extensions, real-wallet holder concentration (liquidity pools excluded), liquidity, and a live sell-route test. Returns SAFE, CAUTION or DANGER with plain-language reasons. 5 free checks per day.",
  similes: [
    "is this token safe",
    "honeypot check",
    "check token safety",
    "solana token safety check",
    "can I sell this token",
  ],
  examples: [
    [
      {
        input: {
          mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        },
        output: {
          status: "success",
          verdict: "SAFE",
          reasons: [
            "Well-known token: JUP (Jupiter). Any mint/freeze authority is held by the issuer by design — not a rug signal.",
          ],
        },
        explanation: "Check whether JUP is safe to buy",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe("The Solana token mint address"),
  }),
  handler: async (_agent, input) => {
    try {
      const res = await fetchMosnTokenCheck(input.mint);
      return {
        status: "success",
        verdict: res.verdict,
        reasons: res.reasons,
        response: res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default mosnTokenCheckAction;
