import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";
import { create_image } from "../tools/create_image";

export const SolanaCreateImageAction: Action = {
  name: "solana_create_image",
  similes: ["generate_image", "create_image"],
  description: "Create an image using OpenAI's DALL-E. Input should be a string prompt for the image.",
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                prompt: "A futuristic cityscape",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { imageUrl: "https://example.com/image.png" },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await create_image(agent, input.prompt);
    return {
      success: true,
      data: result,
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        prompt: z.string(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
