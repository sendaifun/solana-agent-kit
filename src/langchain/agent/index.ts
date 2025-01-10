import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { create_image } from "../../tools/create_image";

export class SolanaGetWalletAddressTool extends Tool {
  name = "solana_get_wallet_address";
  description = `Get the wallet address of the agent`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    return this.solanaKit.wallet_address.toString();
  }
}

export class SolanaCreateImageTool extends Tool {
  name = "solana_create_image";
  description =
    "Create an image using OpenAI's DALL-E. Input should be a string prompt for the image.";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: string): void {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Input must be a non-empty string prompt");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      this.validateInput(input);
      const result = await create_image(this.solanaKit, input.trim());

      return JSON.stringify({
        status: "success",
        message: "Image created successfully",
        ...result,
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

export class SolanaCloseEmptyTokenAccounts extends Tool {
  name = "close_empty_token_accounts";
  description = `Close all empty spl-token accounts and reclaim the rent`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const { signature, size } =
        await this.solanaKit.closeEmptyTokenAccounts();

      return JSON.stringify({
        status: "success",
        message: `${size} accounts closed successfully. ${size === 48 ? "48 accounts can be closed in a single transaction try again to close more accounts" : ""}`,
        signature,
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
