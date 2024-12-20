import { getAllTld } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";

/**
 * Get all top-level domains (TLDs) for the agent's connection
 * @param agent - SolanaAgentKit instance
 * @returns Promise resolving to an array of TLDs
 */
export async function getAllDomainsTLDs(agent: SolanaAgentKit) {
  return getAllTld(agent.connection);
}
