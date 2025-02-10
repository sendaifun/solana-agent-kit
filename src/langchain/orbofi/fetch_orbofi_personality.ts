import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaOrbofiPersonalityFinder extends Tool {
  name = "orbofi_personality_finder";
  description = `Find one of to 2 million + celebrity/character system prompts by searching any name
    
    Inputs (input is a json string):
    celebrity_name: string (required)
    `;
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }
  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const tx = await this.solanaKit.fetchOrbofiPersonalityPrompt(
        inputFormat.celebrity_name
      );
      return JSON.stringify({
        status: "success",
        message: `Searched Celebrity/Character ${inputFormat.celebrity_name} succesfully!`,
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
