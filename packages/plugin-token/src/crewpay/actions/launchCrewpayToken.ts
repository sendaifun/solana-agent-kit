import { type Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { launchCrewpayToken } from "../tools/launchCrewpayToken";

const launchCrewpayTokenAction: Action = {
  name: "CREWPAY_LAUNCH_TOKEN",
  similes: [
    "launch token with crewpay",
    "launch memecoin and hire kols",
    "launch pumpfun token with a kol crew",
    "launch bags token with crewpay",
    "launch coin and earn creator fees",
  ],
  description:
    "Agents earn 15% of creator fees onchain: launches a coin on Pump.fun (default) or Bags.fm via CrewPay and writes a permanent fee-share config: 60% to a hired human KOL crew who promote it, 15% to this agent's wallet as the launching agent, 25% to the CrewPay treasury (60/15/5/20 with a referral). Non-custodial: CrewPay builds unsigned transactions, the agent wallet signs locally. Spends SOL (create fee, ≥0.02 SOL). Requires CREWPAY_API_KEY. Run CREWPAY_PREVIEW_LAUNCH first.",
  examples: [
    [
      {
        input: {
          name: "Night Owl",
          ticker: "HOOT",
          description: "An owl that only trades after midnight",
          imageUrl: "https://example.com/owl.png",
        },
        output: {
          status: "success",
          result: {
            mint: "7nxQB...",
            feeShareLocked: true,
            coinUrl: "https://crewpay.dev/coin/7nxQB...",
          },
        },
        explanation: "Launch on Pump.fun with an auto-hired KOL crew",
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
      .describe("Coin description (max 204 chars)"),
    imageUrl: z.string().url().describe("PNG/JPEG/WebP/GIF image URL"),
    platform: z
      .enum(["pumpfun", "bags"])
      .optional()
      .describe("Launch venue (default pumpfun)"),
    autoHireSeats: z
      .number()
      .int()
      .min(1)
      .max(8)
      .optional()
      .describe("KOL seats to auto-hire when no crew is given (default 5)"),
    crew: z
      .array(
        z.object({
          handle: z.string(),
          wallet: z.string(),
          share: z.number().int().min(1).max(100),
        }),
      )
      .optional()
      .describe("Explicit crew; shares must total 100"),
    initialBuySol: z
      .number()
      .min(0)
      .max(10)
      .optional()
      .describe("Optional dev buy in SOL"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await launchCrewpayToken(agent, {
        name: input.name,
        ticker: input.ticker,
        description: input.description,
        imageUrl: input.imageUrl,
        platform: input.platform,
        autoHireSeats: input.autoHireSeats,
        crew: input.crew,
        initialBuySol: input.initialBuySol,
      });
      return { status: "success", result };
    } catch (error: any) {
      return {
        status: "error",
        message: `CrewPay launch failed: ${error.message}`,
      };
    }
  },
};

export default launchCrewpayTokenAction;
