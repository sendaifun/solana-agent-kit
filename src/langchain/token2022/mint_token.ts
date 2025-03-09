import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaMintToAccountTool extends Tool {
  name = "solana_mint_to_account";
  description = `This tool mints tokens to a specified account.

  Inputs (input is a JSON string):
  owner: string, eg "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMsCVZ93TK" (required)
  tokenMint: string, eg "So11111111111111111111111111111111111111112" (required)
  amount: bigint, eg 10000000000 (required, amount in token decimals)
  program?: string, eg "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" (optional, defaults to TOKEN_2022_PROGRAM_ID)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.mintToAccount(
        new PublicKey(parsedInput.tokenMint),
        parsedInput.amount,
        new PublicKey(parsedInput.owner),
        parsedInput.v2 || true,
      );

      return JSON.stringify({
        status: "success",
        message: "Tokens minted successfully",
        transaction: signature,
        owner: parsedInput.owner,
        tokenMint: parsedInput.tokenMint,
        amount: parsedInput.amount,
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
