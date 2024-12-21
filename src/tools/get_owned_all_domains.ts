import { SolanaAgentKit } from "../agent";
import { PublicKey } from "@solana/web3.js";
import { NameAccountAndDomain, TldParser } from "@onsol/tldparser";

/**
 * Get all domains owned domains for a specific TLD for the agent's wallet
 * @param agent SolanaAgentKit instance
 * @param owner - PublicKey of the owner
 * @returns Promise resolving to an array of owned domains or an empty array if none are found
 */
export async function getOwnedAllDomains(
  agent: SolanaAgentKit,
  owner:PublicKey
): Promise<NameAccountAndDomain[]> {
  try {
    return new TldParser(agent.connection).getParsedAllUserDomains(owner);
  } catch (error: any) {
    throw new Error(`Failed to fetch owned domains: ${error.message}`);
  }
}
