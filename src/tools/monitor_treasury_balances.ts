import { PublicKey } from "@solana/web3.js";
import {
  getGovernanceAccounts,
  getNativeTreasuryAddress,
  Governance,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Monitors the balances of all treasuries associated with a governance.
 *
 * @param agent The {@link SolanaAgentKit} instance.
 * @param governancePubkey The public key of the governance.
 * @returns The balances of all treasuries associated with the governance.
 * Each balance object contains the `account` public key, the `solBalance` in SOL,
 * and the `splTokens` balance of SPL tokens associated with the treasury.
 * The `splTokens` property is an array of objects with `mint` and `balance` properties.
 * The `mint` property is the mint address of the SPL token, and the `balance` property is the balance of the SPL token in UI units.
 */
export async function monitor_treasury_balances(
  agent: SolanaAgentKit,
  governancePubkey: PublicKey,
): Promise<
  {
    account: PublicKey;
    solBalance: number;
    splTokens: { mint: string; balance: number }[];
  }[]
> {
  try {
    const connection = agent.connection;
    // Fetch all governance accounts
    const governanceAccounts = await getGovernanceAccounts(
      connection,
      governancePubkey,
      Governance,
    );

    const balances = [];

    // Iterate over governance accounts to fetch treasury balances
    for (const governance of governanceAccounts) {
      // Compute the native treasury address
      const treasuryAddress = await getNativeTreasuryAddress(
        governancePubkey,
        governance.pubkey,
      );

      // Fetch the SOL balance of the treasury
      const solBalance = (await connection.getBalance(treasuryAddress)) / 1e9;

      // Fetch SPL token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        treasuryAddress,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          ),
        },
      );

      const splTokens = tokenAccounts.value.map((tokenAccount) => {
        const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
        return {
          mint: tokenAccount.account.data.parsed.info.mint,
          balance: tokenAmount.uiAmount,
        };
      });

      balances.push({ account: treasuryAddress, solBalance, splTokens });
    }

    return balances;
  } catch (error) {
    console.error("Failed to monitor treasury balances:", error);
    throw error;
  }
}
