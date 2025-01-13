import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaBalanceOtherTool extends Tool {
  name = "solana_balance_other";
  description = `Get the balance of a Solana wallet or token account which is different from the agent's wallet.

  If no tokenAddress is provided, the SOL balance of the wallet will be returned.

  Inputs ( input is a JSON string ):
  walletAddress: string, eg "GDEkQF7UMr7RLv1KQKMtm8E2w3iafxJLtyXu3HVQZnME" (required)
  tokenAddress: string, eg "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { walletAddress, tokenAddress } = JSON.parse(input);

      const tokenPubKey = tokenAddress
        ? new PublicKey(tokenAddress)
        : undefined;

      const balance = await this.solanaKit.getBalanceOther(
        new PublicKey(walletAddress),
        tokenPubKey,
      );

      return JSON.stringify({
        status: "success",
        balance,
        wallet: walletAddress,
        token: tokenAddress || "SOL",
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
