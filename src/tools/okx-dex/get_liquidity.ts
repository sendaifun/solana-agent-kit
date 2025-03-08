import { SolanaAgentKit } from "../../index";
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
      privateKey: process.env.OKX_SOLANA_PRIVATE_KEY!,
      walletAddress: process.env.OKX_SOLANA_WALLET_ADDRESS!
    }
  });
};

export async function getLiquidity(agent: SolanaAgentKit): Promise<any> {
  const dexClient = initDexClient();
  const liquidity = await dexClient.dex.getLiquidity('501');
  return liquidity;
}
