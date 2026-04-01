import { z } from "zod";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { launchTokenOnVybes } from "../tools/launchToken";

const schema = z.object({
  name: z.string().min(1).max(32).describe("Token name"),
  symbol: z.string().min(2).max(10).describe("Token ticker symbol"),
  description: z.string().optional().describe("Token description"),
  style: z
    .enum([
      "meme",
      "cute",
      "cool",
      "hype",
      "moon",
      "pixel",
      "anime",
      "3d",
      "logo",
      "degen",
    ])
    .optional()
    .describe("AI logo style (default: meme)"),
});

const vybesLaunchAction: Action = {
  name: "LAUNCH_VYBES_TOKEN",
  similes: [
    "launch token on vybes",
    "create vybes token",
    "deploy meme coin on vybes",
    "launch on vybes.fun",
    "create solana token on vybes",
  ],
  description:
    "Launch a new Solana meme token on vybes.fun with bonding curve and AI-generated logo. " +
    "Free to launch. The token gets a bonding curve for trading and graduates to Meteora DEX at ~85 SOL.",
  examples: [
    [
      {
        input: {
          name: "Moon Dog",
          symbol: "MDOG",
          description: "A meme token for dog lovers",
          style: "meme",
        },
        output: {
          status: "success",
          tokenAddress: "7nxQB...",
          uuid: "abc-123",
          viewUrl: "https://vybes.fun/launch/abc-123",
        },
        explanation:
          "Launch a meme token with auto-generated logo on vybes.fun",
      },
    ],
  ],
  schema,
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await launchTokenOnVybes(agent, {
        name: input.name,
        symbol: input.symbol,
        description: input.description,
        style: input.style,
      });
      return {
        status: "success",
        tokenAddress: result.tokenAddress,
        uuid: result.uuid,
        viewUrl: result.viewUrl,
        paymentTx: result.paymentTx,
        message: `Launched ${input.name} ($${input.symbol}) on vybes.fun`,
      };
    } catch (error: any) {
      return { status: "error", message: `Launch failed: ${error.message}` };
    }
  },
};

export default vybesLaunchAction;
export { vybesLaunchAction };
