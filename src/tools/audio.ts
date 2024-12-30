import { SolanaAgentKit } from "../index";
import fs from "fs";
import OpenAI from "openai";

/**
 * Turn text into lifelike spoken audio.
 * @param agent SolanaAgentKit instance
 * @param prompt Text to generate audio for
 * @param path A path to a file for saving the audio
 * @returns Object containing the audio path
 */
export async function text_to_speech(
  agent: SolanaAgentKit,
  prompt: string,
  path: string,
) {
  try {
    if (!agent.openai_api_key) {
      throw new Error("OpenAI API key not found in agent configuration");
    }

    const openai = new OpenAI({
      apiKey: agent.openai_api_key,
    });

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: prompt,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(path, buffer);

    return {
      path: path
    };
  } catch (error: any) {
    throw new Error(`Text to speech failed: ${error.message}`);
  }
}
