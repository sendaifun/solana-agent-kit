import { getAllDomains } from "@bonfida/spl-name-service";
import { SolanaAgentKit } from "../agent";
import { PublicKey } from "@solana/web3.js";

/**
 * Get all domains owned by a specific address
 * @param agent SolanaAgentKit instance
 * @param owner Owner's public key
 * @returns Array of owned domain names
 */
export async function getOwnedAllDomains(
  agent: SolanaAgentKit,
  owner: PublicKey
): Promise<string[]> {
  try {
    const domains = await getAllDomains(agent.connection, owner);
    return domains.map(domain => domain.name);
  } catch (error: any) {
    throw new Error(`Failed to fetch owned domains: ${error.message}`);
  }
}
