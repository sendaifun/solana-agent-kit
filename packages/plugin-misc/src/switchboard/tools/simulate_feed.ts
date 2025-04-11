import { CrossbarClient } from "@switchboard-xyz/common";
import { SWITCHBOARD_DEFAULT_CROSSBAR } from "../constants";

/**
 * Simulate a switchboard feed
 * @param agent SolanaAgentKit instance
 * @param feed Public key of the feed to simulate as base58
 * @param crossbarUrl The url of the crossbar instance to use
 * @returns Result of the simulation
 */

export async function simulate_switchboard_feed(
  feed: string,
  crossbarUrl: string = SWITCHBOARD_DEFAULT_CROSSBAR,
): Promise<string> {
  try {
    const crossbar = new CrossbarClient(crossbarUrl, true);
    const results = await crossbar.simulateSolanaFeeds("mainnet", [feed]);

    if (results.length === 0) {
      throw new Error(
        `Error simulating feed ${feed}. Did you provide the right mainnet feed hash?`,
      );
    }

    return results[0].results.toString();
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
}
