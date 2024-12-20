import { TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";

/**
 * Resolve all domains for a given agent and domain
 * @param agent - SolanaAgentKit instance
 * @param domain - The domain to resolve
 * @returns Promise resolving to the owner of the domain
 */
export async function resolveAllDomains(agent: SolanaAgentKit, domain: string) {
  return new TldParser(agent.connection).getOwnerFromDomainTld(domain);
}
