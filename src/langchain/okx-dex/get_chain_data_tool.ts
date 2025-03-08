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

export class OkxDexChainsTool extends Tool {
  name = "okx_dex_chains";
  description = `Get chains supported by OKX DEX.

  No specific input needed. Just call the tool to get the list.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const dexClient = initDexClient();
      const chains = await dexClient.dex.getChainData('501');

      const chainList = chains.data.map((chain: any) => ({
        name: chain.name,
        id: chain.id,
        nativeCurrency: chain.nativeCurrency
      }));

      return JSON.stringify({
        status: "success",
        summary: `OKX DEX supports ${chainList.length} chains, including: ${chainList.map((c: { name: string }) => c.name).join(", ")}`,
        data: chainList
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message || "Failed to get supported chains",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}