import { getFavoriteDomain as _getFavoriteDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";


/**
 * Get the user's main/favorite domain for a SolanaAgentKit instance
 * @param agent SolanaAgentKit instance
 * @param owner Owner's public key
 * @returns Promise resolving to the main domain name or null if not found
 */
export async function getMainAllDomainsDomain(
  agent: any,
  owner: PublicKey
): Promise<string | null> {
  let mainDomain = null;
  try {
    mainDomain = await _getFavoriteDomain(agent.connection, owner);
    return mainDomain.stale ? null : mainDomain.reverse;
  } catch (error: any) {
    console.log("No main/favorite domain found");
  }
  return null
}

