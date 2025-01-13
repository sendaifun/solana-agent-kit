import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaTipLinkTool extends Tool {
  name = "solana_tiplink";
  description = `Create a TipLink for transferring SOL or SPL tokens.
  Input is a JSON string with:
  - amount: number (required) - Amount to transfer
  - splmintAddress: string (optional) - SPL token mint address`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      if (!parsedInput.amount) {
        throw new Error("Amount is required");
      }

      const amount = parseFloat(parsedInput.amount);
      const splmintAddress = parsedInput.splmintAddress
        ? new PublicKey(parsedInput.splmintAddress)
        : undefined;

      const { url, signature } = await this.solanaKit.createTiplink(
        amount,
        splmintAddress,
      );

      return JSON.stringify({
        status: "success",
        url,
        signature,
        amount,
        tokenType: splmintAddress ? "SPL" : "SOL",
        message: `TipLink created successfully`,
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
