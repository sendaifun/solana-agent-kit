import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Get a list of liquidity that are available for swap in the OKX aggregation protocol.
 *
 * @param agent          @SolanaAgentKit instance
 * @param chainId        Unique identifier for the chain.
 *
 */

export async function getLiquidity(agent: SolanaAgentKit, chainId: string) {
  const okxClient: OKXDexClient = new OKXDexClient({
    apiKey: agent.config.OKX_API_KEY ?? "",
    secretKey: agent.config.OKX_SECRET_KEY ?? "",
    apiPassphrase: agent.config.OKX_API_PASSPHRASE ?? "",
    projectId: agent.config.OKX_PROJECT_ID ?? "",
    solana: {
      wallet: {
        publicKey: agent.wallet.publicKey,
        connection: agent.connection,
        signTransaction: agent.wallet.signTransaction,
        signAllTransactions: agent.wallet.signAllTransactions,
        signAndSendTransaction: agent.wallet.signAndSendTransaction,
        signMessage: agent.wallet.signMessage,
      },
      computeUnits: 300000,
      maxRetries: 3,
    },
  });

  const liquidity = (await okxClient.dex.getLiquidity(chainId)).data;

  return liquidity;
}
