import { z } from "zod";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { generateVybesLogo } from "../tools/generateLogo";

const schema = z.object({
  name: z.string().min(1).describe("Token or project name"),
  symbol: z.string().min(1).max(10).describe("Token ticker symbol"),
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
    .describe("Logo style (default: meme)"),
});

const vybesLogoAction: Action = {
  name: "GENERATE_VYBES_LOGO",
  similes: [
    "generate vybes logo",
    "create token logo on vybes",
    "make ai logo",
    "generate token art",
    "vybes logo",
  ],
  description:
    "Generate an AI logo for a token using vybes.fun Workers AI (FLUX model). " +
    "Free, no payment required. Returns public URL to 1024x1024 PNG. " +
    "10 styles: meme, cute, cool, hype, moon, pixel, anime, 3d, logo, degen.",
  examples: [
    [
      {
        input: { name: "Moon Cat", symbol: "MCAT", style: "pixel" },
        output: {
          status: "success",
          imageUrl: "https://...",
          style: "pixel",
        },
        explanation: "Generate a pixel art logo for Moon Cat token",
      },
    ],
  ],
  schema,
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await generateVybesLogo({
        name: input.name,
        symbol: input.symbol,
        style: input.style,
      });
      return {
        status: "success",
        imageUrl: result.imageUrl,
        style: result.style,
        message: `Generated ${result.style} logo for ${input.name}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Logo generation failed: ${error.message}`,
      };
    }
  },
};

export default vybesLogoAction;
export { vybesLogoAction };
