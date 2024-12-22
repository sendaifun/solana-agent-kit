import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Get the user's main/favorite domain
 * @param agent - SolanaAgentKit instance
 * @param owner - PublicKey of the owner
 * @returns Promise resolving to the main domain or null
 */
export async function getMainAllDomainsDomain(
    agent: SolanaAgentKit,
    owner: PublicKey
): Promise<string | null> {
    let mainDomain = null;
    try {
        mainDomain = await getFavoriteDomain(agent.connection, owner);
        return mainDomain.stale ? null : mainDomain.reverse;
    } catch (error: any) {
        console.log("No main/favorite domain found");
    }
    return null
}