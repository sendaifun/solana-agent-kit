import { getAllDomains } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { getAllDomainsTLDs } from "../../alldomains/tools";

/**
 * Get all registered domains across all TLDs
 * @param agent SolanaAgentKit instance
 * @returns Array of all registered domain names with their TLDs
 */
export async function getAllRegisteredAllDomains(
  agent: SolanaAgentKit,
): Promise<string[]> {
  try {
    // First get all TLDs
    const tlds = await getAllDomainsTLDs(agent);
    const allDomains: string[] = [];

    // For each TLD, fetch all registered domains
    for (const tld of tlds) {
      const domains = await getAllDomains(
        agent.connection,
        new PublicKey("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"),
      );

      // Add domains with TLD suffix
      domains.forEach((domain) => {
        allDomains.push(`${domain}.${tld}`);
      });
    }

    return allDomains;
  } catch (error: any) {
    throw new Error(`Failed to fetch all registered domains: ${error.message}`);
  }
}
