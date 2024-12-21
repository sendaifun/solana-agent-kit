import { NameAccountAndDomain, TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../agent";
import { PublicKey } from "@solana/web3.js";
/**
 * Get all domains owned by an address for a specific TLD
 * @param agent SolanaAgentKit instance
 * @param tld Top-level domain (e.g., "sol")
 * @returns Promise resolving to an array of owned domain names for the specified TLD or an empty array if none are found 
 */
export async function getOwnedDomainsForTLD(
  agent: SolanaAgentKit,
  tld: string
): Promise<NameAccountAndDomain[]> {
  try {
    return new TldParser(agent.connection)
      .getParsedAllUserDomainsFromTld(
        agent.wallet_address,
        tld
      )
  } catch (error: any) {
    throw new Error(`Failed to fetch domains for TLD: ${error.message}`);
  }
}


