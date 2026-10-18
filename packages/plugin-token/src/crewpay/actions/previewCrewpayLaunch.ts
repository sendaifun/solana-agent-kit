import { type Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { previewCrewpayLaunch } from "../tools/previewCrewpayLaunch";

const previewCrewpayLaunchAction: Action = {
  name: "CREWPAY_PREVIEW_LAUNCH",
  similes: [
    "preview crewpay launch",
    "crewpay quickstart",
    "how much would I earn launching a coin",
    "preview token launch with kol crew",
    "dry run memecoin launch with crewpay",
  ],
  description:
    "Agents earn 15% of creator fees onchain when they launch through CrewPay. Free, read-only preview of a CrewPay launch (no key, no wallet, no transaction): returns the human KOL crew CrewPay would hire, the fee map (60% crew / 15% launching agent / 25% treasury) and costs. Use before CREWPAY_LAUNCH_TOKEN.",
  examples: [
    [
      {
        input: { name: "Night Owl", ticker: "HOOT", description: "owl meme" },
        output: {
          status: "success",
          preview: {
            feeMap: { crewPoolBps: 6000, agentBps: 1500, platformBps: 2500 },
            crew: [{ handle: "@example", sharePctOfCrewPool: 20 }],
          },
        },
        explanation: "Preview the crew and fee split before launching",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(2).max(32).describe("Coin name"),
    ticker: z.string().min(2).max(13).describe("Coin ticker"),
    description: z
      .string()
      .max(204)
      .optional()
      .describe("Optional description used to match the crew"),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const preview = await previewCrewpayLaunch(
        input.name,
        input.ticker,
        input.description,
      );
      return { status: "success", preview };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default previewCrewpayLaunchAction;
