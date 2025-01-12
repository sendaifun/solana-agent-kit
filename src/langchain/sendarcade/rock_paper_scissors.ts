import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaRockPaperScissorsTool extends Tool {
  name = "rock_paper_scissors";
  description = `Play rock paper scissors to win SEND coins.

  Inputs (input is a JSON string):
  choice: string, either "rock", "paper", or "scissors" (required)
  amount: number, amount of SOL to play with - must be 0.1, 0.01, or 0.005 SOL (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (input.choice !== undefined) {
      throw new Error("choice is required.");
    }
    if (
      input.amount !== undefined &&
      (typeof input.spaceKB !== "number" || input.spaceKB <= 0)
    ) {
      throw new Error("amount must be a positive number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      this.validateInput(parsedInput);
      const result = await this.solanaKit.rockPaperScissors(
        Number(parsedInput['"amount"']),
        parsedInput['"choice"'].replace(/^"|"$/g, "") as
          | "rock"
          | "paper"
          | "scissors",
      );

      return JSON.stringify({
        status: "success",
        message: result,
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
