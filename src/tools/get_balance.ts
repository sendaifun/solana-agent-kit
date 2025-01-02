import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getTokenMetadata } from "../utils/tokenMetadata";

/**
 * Get the balance of SOL or an SPL token for the agent's wallet
 * @param agent - SolanaAgentKit instance
 * @param token_address - Optional SPL token mint address. If not provided, returns SOL balance
 * @returns Promise resolving to the balance as a number (in UI units) or null if account doesn't exist
 */
export async function get_balance(
  agent: SolanaAgentKit,
  token_address?: PublicKey,
): Promise<
  | number
  | {
      sol: number;
      tokens: Array<{
        tokenAddress: string;
        name: string;
        symbol: string;
        balance: number;
        decimals: number;
      }>;
    }
> {
  if (!token_address) {
    const [lamportsBalance, tokenAccountData] = await Promise.all([
      agent.connection.getBalance(agent.wallet_address),
      agent.connection.getParsedTokenAccountsByOwner(agent.wallet_address, {
        programId: TOKEN_PROGRAM_ID,
      }),
    ]);

    const removedZeroBalance = tokenAccountData.value.filter(
      (v) => v.account.data.parsed.info.tokenAmount.uiAmount !== 0,
    );

    const tokenBalances = await Promise.all(
      removedZeroBalance.map(async (v) => {
        const mint = v.account.data.parsed.info.mint;
        const mintInfo = await getTokenMetadata(agent.connection, mint);
        return {
          tokenAddress: mint,
          name: mintInfo.name ?? "",
          symbol: mintInfo.symbol ?? "",
          balance: v.account.data.parsed.info.tokenAmount.uiAmount as number,
          decimals: v.account.data.parsed.info.tokenAmount.decimals as number,
        };
      }),
    );

    const solBalance = lamportsBalance / LAMPORTS_PER_SOL;

    return {
      sol: solBalance,
      tokens: tokenBalances,
    };
  }

  const token_account =
    await agent.connection.getTokenAccountBalance(token_address);
  return token_account.value.uiAmount || 0;
}
