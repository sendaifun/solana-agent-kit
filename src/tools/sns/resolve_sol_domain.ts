import { resolve } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";

/**
 * Resolves a .sol domain to a Solana PublicKey.
 *
 * This function uses the Bonfida SPL Name Service to resolve a given .sol domain
 * to the corresponding Solana PublicKey. The domain can be provided with or without
 * the .sol suffix.
 *
 * @param agent SolanaAgentKit instance
 * @param domain The .sol domain to resolve. This can be provided with or without the .sol TLD suffix
 * @returns A promise that resolves to the corresponding Solana PublicKey
 * @throws Error if the domain resolution fails
 */
export async function resolveSolDomain(
  agent: SolanaAgentKit,
  domain: string,
): Promise<PublicKey> {
  if (!domain || typeof domain !== "string") {
    throw new Error("Invalid domain. Expected a non-empty string.");
  }

  try {
    return await resolve(agent.connection, domain);
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to resolve domain: ${domain}`);
  }
}
