import { getPrimaryDomain as _getPrimaryDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Retrieves the primary .sol domain associated with a given Solana public key.
 *
 * This function queries the Bonfida SPL Name Service to get the primary .sol domain for
 * a specified Solana public key. If the primary domain is stale or an error occurs during
 * the resolution, it throws an error.
 *
 * @param agent SolanaAgentKit instance
 * @param account The Solana public key for which to retrieve the primary domain
 * @returns A promise that resolves to the primary .sol domain as a string
 * @throws Error if the domain is stale or if the domain resolution fails
 */
export async function getPrimaryDomain(
  agent: SolanaAgentKit,
  account: PublicKey,
): Promise<string> {
  try {
    const { reverse, stale } = await _getPrimaryDomain(
      agent.connection,
      account,
    );
    if (stale) {
      throw new Error(
        `Primary domain is stale for account: ${account.toBase58()}`,
      );
    }
    return reverse;
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `Failed to get primary domain for account: ${account.toBase58()}`,
    );
  }
}
