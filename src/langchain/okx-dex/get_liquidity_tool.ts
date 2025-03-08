import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { OKXDexClient } from '@okx-dex/okx-dex-sdk';
import * as dotenv from "dotenv";

dotenv.config();

// Initialize the OKX DEX client
const initDexClient = () => {
  return new OKXDexClient({
    apiKey: process.env.OKX_API_KEY!,
    secretKey: process.env.OKX_SECRET_KEY!,
    apiPassphrase: process.env.OKX_API_PASSPHRASE!,
    projectId: process.env.OKX_PROJECT_ID!,
    solana: {
      connection: {
        rpcUrl: process.env.RPC_URL!,
        confirmTransactionInitialTimeout: 60000
      },
      privateKey: process.env.SOLANA_PRIVATE_KEY!,
      walletAddress: process.env.SOLANA_WALLET_ADDRESS!
    }
  });
};

export class OkxDexLiquidityTool extends Tool {
  name = "okx_dex_liquidity";
  description = `Get liquidity sources supported by OKX DEX on Solana.

  No specific input needed. Just call the tool to get the list.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const dexClient = initDexClient();
      const liquidity = await dexClient.dex.getLiquidity('501');

      // Format the liquidity sources for better readability
      const sources = liquidity.data.map((source: any) => ({
        name: source.name,
        id: source.id
      }));

      return JSON.stringify({
        status: "success",
        summary: `OKX DEX aggregates ${sources.length} liquidity sources on Solana: ${sources.map((s: { name: string }) => s.name).join(", ")}`,
        data: sources
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message || "Failed to get liquidity sources",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}