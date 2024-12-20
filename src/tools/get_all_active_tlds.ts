import {
  NameRegistryState,
  getAllDomains,
  ROOT_DOMAIN_ACCOUNT,
} from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Get all active top-level domains (TLDs) in the Solana name service
 * @param agent SolanaAgentKit instance
 * @returns Array of active TLD strings
 */
export async function getAllDomainsTLDs(
  agent: SolanaAgentKit
): Promise<string[]> {
  try {
    // Get the root domain record
    const rootAccount = await NameRegistryState.retrieve(
      agent.connection,
      ROOT_DOMAIN_ACCOUNT
    );

    if (!rootAccount) {
      throw new Error("Root domain account not found");
    }

    // Fetch all TLD records under the root domain
    const tldAccounts = await agent.connection.getProgramAccounts(
      new PublicKey("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"),
      {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: rootAccount.registry.owner.toBase58(),
            },
          },
        ],
      }
    );

    // Parse the TLD names from the accounts
    const tlds: string[] = [];
    for (const account of tldAccounts) {
      const registry = await NameRegistryState.retrieve(
        agent.connection,
        account.pubkey
      );

      if (registry && registry.registry.data) {
        const tldName = Buffer.from(registry.registry.data)
          .toString()
          .replace(/\0/g, "");
        if (tldName) {
          tlds.push(tldName);
        }
      }
    }

    return tlds;
  } catch (error: any) {
    throw new Error(`Failed to fetch TLDs: ${error.message}`);
  }
}
