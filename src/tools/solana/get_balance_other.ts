import {
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";

/**
 * Get the balance of SOL or an SPL token for the specified wallet address (other than the agent's wallet)
 * @param agent - SolanaAgentKit instance
 * @param wallet_address - Public key of the wallet to check balance for
 * @param token_address - Optional SPL token mint address. If not provided, returns SOL balance
 * @returns Promise resolving to the balance as a number (in UI units) or 0 if account doesn't exist
 */
export async function get_balance_other(
  agent: SolanaAgentKit,
  wallet_address: PublicKey,
  token_address?: PublicKey,
): Promise<number> {
  try {
    if (!token_address) {
      return (
        (await agent.connection.getBalance(wallet_address)) / LAMPORTS_PER_SOL
      );
    }

    const tokenAccounts = await agent.connection.getTokenAccountsByOwner(
      wallet_address,
      { mint: token_address },
    );

    if (tokenAccounts.value.length === 0) {
      console.warn(
        `No token accounts found for wallet ${wallet_address.toString()} and token ${token_address.toString()}`,
      );
      return 0;
    }

    const tokenAccount = await agent.connection.getParsedAccountInfo(
      tokenAccounts.value[0].pubkey,
    );
    const tokenData = tokenAccount.value?.data as ParsedAccountData;

    return tokenData.parsed?.info?.tokenAmount?.uiAmount || 0;
  } catch (error) {
    throw new Error(
      `Error fetching on-chain balance for ${token_address?.toString()}: ${error}`,
    );
  }
}
