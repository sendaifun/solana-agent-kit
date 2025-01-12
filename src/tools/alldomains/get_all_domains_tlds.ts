import { SolanaAgentKit } from "../../index";
import { getAllTld } from "@onsol/tldparser";

/**
 * Get all active top-level domains (TLDs) in the AllDomains Name Service
 * @param agent SolanaAgentKit instance
 * @returns Array of active TLD strings
 */
export async function getAllDomainsTLDs(
  agent: SolanaAgentKit,
): Promise<string[]> {
  try {
    const tlds = await getAllTld(agent.connection);
    return tlds.map((tld) => String(tld.tld));
  } catch (error: any) {
    throw new Error(`Failed to fetch TLDs: ${error.message}`);
  }
}
