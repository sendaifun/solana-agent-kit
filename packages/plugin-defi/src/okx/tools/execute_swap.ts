import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Generate the data to call the OKX DEX router to execute a swap.
 *
 * @param agent               @SolanaAgentKit instance
 * @param chainId             Unique identifier for the chain.
 * @param fromTokenAddress    Address of the mint account being swapped from
 * @param toTokenAddress      Address of the mint account being swapped to
 * @param userWalletAddress   The account of user
 * @param amount              Token amount for the quote.
 * @param slippage            Slippage limit
 */
export async function executeSwap(
  agent: SolanaAgentKit,
  chainId: string,
  fromTokenAddress: string,
  toTokenAddress: string,
  userWalletAddress: string,
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
        ...agent.wallet,
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

  const result = await okxClient.dex.executeSwap({
    chainId,
    fromTokenAddress,
    toTokenAddress,
    amount,
    slippage,
    userWalletAddress,
  });

  return result;
}
