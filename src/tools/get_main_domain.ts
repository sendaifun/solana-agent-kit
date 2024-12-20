import { getFavoriteDomain as _getFavoriteDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";


/**
 * Get the user's main/favorite domain for a SolanaAgentKit instance
 * @param agent SolanaAgentKit instance
 * @param owner Owner's public key
 * @returns Promise resolving to the main domain name or null if not set
 */
export async function getMainAllDomainsDomain(
  agent: any,
  owner: PublicKey
): Promise<string | null> {
  try {
    const favDomain = await _getFavoriteDomain(agent.connection, owner);
    return favDomain.stale ? null : favDomain.reverse;
  } catch (error: any) {
    throw new Error(`Failed to fetch main domain: ${error.message}`);
  }
}