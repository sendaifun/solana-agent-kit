import { TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";
import { PublicKey } from "@solana/web3.js";

/**
 * Get all domains owned by the specified owner
 * @param agent - SolanaAgentKit instance
 * @param owner - PublicKey of the owner
 * @returns Promise resolving to an array of owned domains
 */
export async function getOwnedAllDomains(agent: SolanaAgentKit, owner: PublicKey) {
  return new TldParser(agent.connection).getParsedAllUserDomains(owner);
}
