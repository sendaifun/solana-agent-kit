import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Get the best quote for a swap through OKX DEX.
 *
 * @param agent              @SolanaAgentKit instance
 * @param chainId            Unique identifier for the chain.
 * @param fromTokenAddress	 The mint account of a token to be sold
 * @param toTokenAddress	   The mint account of a token to be bought
 * @param amount             The input amount of a token to be sold
 * @param slippage           The number of slippage
 */

export async function getQuote(
  agent: SolanaAgentKit,
  chainId: string,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: string
) {
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

  const quote = (
    await okxClient.dex.getQuote({
      chainId,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage,
    })
  ).data;

  return quote;
}
