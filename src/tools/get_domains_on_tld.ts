import { SolanaAgentKit } from "../agent";
import { getOwnedAllDomains } from "./lookup_owner";
import { PublicKey } from "@solana/web3.js";

/**
 * Get all domains owned by an address for a specific TLD
 * @param agent SolanaAgentKit instance
 * @param owner Owner's public key
 * @param tld Top-level domain (e.g., "sol")
 * @returns Array of owned domain names for the specified TLD
 */
export async function getOwnedDomainsForTLD(
  agent: SolanaAgentKit,
  owner: PublicKey,
  tld: string
): Promise<string[]> {
  try {
    const allDomains = await getOwnedAllDomains(agent, owner);
    return allDomains.filter(domain => domain.endsWith(`.${tld}`));
  } catch (error: any) {
    throw new Error(`Failed to fetch domains for TLD: ${error.message}`);
  }
}
