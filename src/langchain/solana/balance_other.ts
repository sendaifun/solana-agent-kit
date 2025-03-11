import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaBalanceOtherTool extends Tool {
  name = "solana_balance_other";
  description = `Get the balance of ANOTHER wallet (not your own) or token account on Solana.

  This tool should be used when checking someone else's wallet balance or another wallet address.
  For questions like "How much SOL does address X have?" or "What's the USDC balance of wallet Y?".

  Input for checking SOL balance:
  {"walletAddress":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB"}
  
  Input for checking token balance:
  {"walletAddress":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB","tokenAddress":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}
  
  Example: To check someone's SOL balance: {"walletAddress":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB"}
  Example: To check someone's USDC balance: {"walletAddress":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB", "tokenAddress":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}`;

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
