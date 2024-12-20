import { findMainDomain, MainDomain } from "@onsol/tldparser";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Get the main domain for the given owner
 * @param agent - SolanaAgentKit instance
 * @param owner - PublicKey of the owner
 * @returns Promise resolving to the main domain or null if not found
 */
export async function getMainAllDomainsDomain(agent: SolanaAgentKit, owner: PublicKey) {
  const [mainDomainPubkey] = findMainDomain(owner);
  let mainDomain = undefined;
  try {
    mainDomain = await MainDomain.fromAccountAddress(agent.connection, mainDomainPubkey);
  } catch (e) {
    console.log("No main domain found");
  }
  return mainDomain;
}
