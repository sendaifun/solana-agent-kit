import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { scoreX402Url } from "../apex";

const deliveryScoreAction: Action = {
  name: "APEX_DELIVERY_SCORE",
  similes: [
    "score an x402 url",
    "x402 delivery score",
    "is this paid api up",
    "check x402 uptime and price",
  ],
  description:
    "Score one https x402 URL from 0 to 100 using watchtower uptime, a valid 402, USDC price, probe speed, and recorded test buys. This does not pay the URL. 0.003 USDC. On HTTP 402, pay the terms with your own wallet.",
  examples: [
    [
      {
        input: { url: "https://apexfaucet.xyz/api/x402/page-markdown" },
        output: { status: "success", result: { http: 402, paid: false } },
        explanation: "An unpaid score returns the x402 terms. The call does not buy the URL being scored.",
      },
    ],
  ],
  schema: z.object({
    url: z.string().describe("https x402 URL to score. This action does not pay it."),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, string>) => {
    return scoreX402Url(input.url);
  },
};

export default deliveryScoreAction;
