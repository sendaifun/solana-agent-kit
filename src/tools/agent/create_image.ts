import { SolanaAgentKit } from "../../index";
import OpenAI from "openai";

/**
 * Generate an image using OpenAI's DALL-E
 * @param agent SolanaAgentKit instance
 * @param prompt Text description of the image to generate
 * @param size Image size ('256x256', '512x512', or '1024x1024') (default: '1024x1024')
 * @param n Number of images to generate (default: 1)
 * @returns Object containing the generated image URLs
 */
export async function create_image(
  agent: SolanaAgentKit,
  prompt: string,
  size: "256x256" | "512x512" | "1024x1024" = "1024x1024",
  n: number = 1,
) {
  try {
    if (!agent.config.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found in agent configuration");
    }

    const openai = new OpenAI({
      apiKey: agent.config.OPENAI_API_KEY,
    });

    const response = await openai.images.generate({
      prompt,
      n,
      size,
    });

    return {
      images: response.data.map((img: any) => img.url),
    };
  } catch (error: any) {
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
