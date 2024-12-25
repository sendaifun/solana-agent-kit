import { TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";
import { PublicKey } from "@solana/web3.js";

/**
 * Resolve all domains for a given agent and domain
 * @param agent SolanaAgentKit instance
 * @param domain Domain name to resolve
 * @returns Promise resolving to the domain or undefined if not found
 */
export async function resolveAllDomains(
  agent: SolanaAgentKit,
  domain: string
): Promise<PublicKey | undefined> {
  try {
    console.log("domain", domain);
    let tld = await new TldParser(agent.connection).getOwnerFromDomainTld(
      domain
    );
    console.log("tld", tld);
    return tld;
  } catch (error: any) {
    // console.log("error", error.);

    if(error.message.includes("Cannot read properties of undefined (reading 'owner')")) {
      return undefined
    }
    throw new Error(`Domain resolution failed: ${error.message}`);
  }
}
