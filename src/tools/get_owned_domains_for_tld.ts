import { TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";

/**
 * Get the owned domains for a specific TLD for the agent's wallet
 * @param agent - SolanaAgentKit instance
 * @param tld - The top-level domain to query
 * @returns Promise resolving to an array of owned domains or an empty array if none are found
 */
export async function getOwnedDomainsForTLD(agent: SolanaAgentKit, tld: string) {
  return new TldParser(agent.connection).getParsedAllUserDomainsFromTld(agent.wallet_address, tld);
}
