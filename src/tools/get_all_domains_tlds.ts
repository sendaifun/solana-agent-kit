import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { getAllTld } from "@onsol/tldparser";

/**
 * Get all active top-level domains (TLDs)
 * @param agent SolanaAgentKit instance
 * @returns String array of active TLD and the related account's public key
 */
export async function getAllDomainsTLDs(
  agent: SolanaAgentKit
): Promise<Array<{
    tld: String;
    parentAccount: PublicKey;
}>> {
  try {
    return getAllTld(agent.connection)
  } catch (error: any) {
    throw new Error(`Failed to fetch TLDs: ${error.message}`);
  }
}