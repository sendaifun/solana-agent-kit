import { TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../../agent";
/**
 * Get all domains owned by an address for a specific TLD
 * @param agent SolanaAgentKit instance
 * @param tld Top-level domain (e.g., "sol")
 * @returns Promise resolving to an array of owned domain names for the specified TLD or an empty array if none are found
 */
export async function getOwnedDomainsForTLD(
  agent: SolanaAgentKit,
  tld: string,
): Promise<string[]> {
  try {
    const domains = await new TldParser(
      agent.connection,
    ).getParsedAllUserDomainsFromTld(agent.wallet_address, tld);
    return domains.map((domain) => domain.domain);
  } catch (error: any) {
    throw new Error(`Failed to fetch domains for TLD: ${error.message}`);
  }
}
