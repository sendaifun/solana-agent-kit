import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import {
  getNameAccountKeySync,
  NAME_PROGRAM_ID,
} from "@bonfida/spl-name-service";
import { SolanaAgentKit } from "../index";

/**
 * Resolve a domain to its public key
 * @param agent SolanaAgentKit instance
 * @param domain Domain name to resolve
 * @returns Associated public key or null if not found
 */
export async function resolveAllDomains(
  agent: SolanaAgentKit,
  domain: string
): Promise<PublicKey | null> {
  try {
    // Convert domain name to buffer for hashing
    const hashedDomain = Buffer.from(domain);

    // Get the name account key using the new sync method
    const nameAccountKey = getNameAccountKeySync(
      hashedDomain,
      undefined, // nameClass
      undefined // nameParent
    );

    // Get the account info to retrieve the owner
    const owner = await agent.connection.getAccountInfo(nameAccountKey);

    if (!owner) {
      return null;
    }

    // The owner's public key is stored in the data buffer starting at offset 32
    return new PublicKey(owner.data.slice(32, 64));
  } catch (error: any) {
    throw new Error(`Domain resolution failed: ${error.message}`);
  }
}
