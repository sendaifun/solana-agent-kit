import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { TldParser } from "@onsol/tldparser";

/**
 * Resolve all domains for a given agent and domain
 * @param agent SolanaAgentKit instance
 * @param tdl The tld
 * @returns Promise resolving to the domain or undefined
 */
export async function resolveAllDomains(
  agent: SolanaAgentKit,
  tdl: string
): Promise<PublicKey | undefined> {
  try {
    return new TldParser(agent.connection).getOwnerFromDomainTld(tdl)
  } catch (error: any) {
    throw new Error(`Domain resolution failed: ${error.message}`);
  }
}