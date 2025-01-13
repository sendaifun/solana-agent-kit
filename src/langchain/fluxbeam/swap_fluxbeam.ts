import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import { Tool } from "langchain/tools";

export class SolanaSwapFluxBeamTool extends Tool {
  name = "solana_swap_fluxbeam";
  description = `This tool can be used to swap tokens using FluxBeam DEX.
    Inputs (input is a JSON string):
    - outputMint (string): eg "So11111111111111111111111111111111111111112" (required)
    - inputAmount (number): eg 1 or 0.01 (required)
    - inputMint (string): eg "USDC" or "So11111111111111111111111111111111111111112" (optional)
    - slippageBps (number): eg 300 for 3% (optional)`;

  constructor(private solanaAgent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      // Parse the JSON input
      const parsedInput = JSON.parse(input);
      const { outputMint, inputAmount, inputMint, slippageBps } = parsedInput;

      if (!outputMint || !inputAmount) {
        throw new Error(
          "Required parameters 'outputMint' and 'inputAmount' are missing.",
        );
      }

      // Perform the token swap using the SolanaAgentKit instance
      const transactionSignature = await this.solanaAgent.swapFluxBeam(
        new PublicKey(outputMint),
        inputAmount,
        inputMint
          ? new PublicKey(inputMint)
          : new PublicKey("So11111111111111111111111111111111111111112"), // Default to SOL
        slippageBps,
      );

      // Return success response
      return JSON.stringify({
        status: "success",
        message: "Swap executed successfully",
        transaction: transactionSignature,
        inputAmount,
        inputToken: inputMint || "USDC",
        outputToken: outputMint,
      });
    } catch (error: any) {
      // Return error response
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
