import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * It fetches a list of tokens. This interface returns a list of tokens that belong to major platforms or are deemed significant enough by OKX.
 * However, you can still quote and swap other tokens outside of this list on OKX DEX.
 *
 * @param agent          @SolanaAgentKit instance
 * @param chainId        Unique identifier for the chain.
 *
 */

export async function getTokens(agent: SolanaAgentKit, chainId: string) {
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

  const tokens = (await okxClient.dex.getTokens(chainId)).data;

  return {
    tokens: tokens,
  };
}
