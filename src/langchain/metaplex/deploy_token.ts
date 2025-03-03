import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDeployTokenTool extends Tool {
  name = "solana_deploy_token";
  description = `Deploy a new token on Solana blockchain.

  Inputs (input is a JSON string):
  name: string, eg "My Token" (required)
  uri: string, eg "https://example.com/token.json" (required)
  symbol: string, eg "MTK" (required)
  decimals?: number, eg 9 (optional, defaults to 9)
  mintAuthority?: string or undfined or null, if its undefined, it will be set to the wallet address
  freezeAuthority?: string or undfined or null, if its undefined, it will be set to the wallet address
  updateAuthority?: string or undfined, if its undefined, it will be set to the wallet address
  isMutable?: boolean or undefined
  initialSupply?: number, eg 1000000 (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.deployToken(
        parsedInput.name,
        parsedInput.uri,
        parsedInput.symbol,
        parsedInput.decimals,
        {
          mintAuthority: parsedInput.mintAuthority,
          freezeAuthority: parsedInput.freezeAuthority,
          updateAuthority: parsedInput.updateAuthority,
          isMutable: parsedInput.isMutable,
        },
        parsedInput.initialSupply,
      );

      return JSON.stringify({
        status: "success",
        message: "Token deployed successfully",
        mintAddress: result.mint.toString(),
        decimals: parsedInput.decimals || 9,
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
