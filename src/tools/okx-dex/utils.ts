import { SolanaAgentKit } from "../../index";
import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import bs58 from "bs58";
export function initDexClient(agent: SolanaAgentKit): OKXDexClient {
  // Validate the required config parameters are present
  if (
    !agent.config?.OKX_API_KEY ||
    !agent.config?.OKX_SECRET_KEY ||
    !agent.config?.OKX_API_PASSPHRASE ||
    !agent.config?.OKX_PROJECT_ID
  ) {
    throw new Error("Missing required OKX DEX configuration in agent config");
  }

  return new OKXDexClient({
    apiKey: agent.config?.OKX_API_KEY,
    secretKey: agent.config?.OKX_SECRET_KEY,
    apiPassphrase: agent.config?.OKX_API_PASSPHRASE,
    projectId: agent.config?.OKX_PROJECT_ID,
    solana: {
      connection: {
        rpcUrl: agent.connection.rpcEndpoint,
        confirmTransactionInitialTimeout: 60000,
      },
      privateKey: bs58.encode(agent.wallet.secretKey),
      walletAddress: agent.wallet_address.toString(),
    },
  });
}
