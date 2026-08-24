import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetchBountyRadarFeed } from "../feed";
import { getBountyRadarUrl } from "../plugin";

const bountyRadarFeedAction: Action = {
  name: "BOUNTY_RADAR_FEED",
  similes: [
    "find agent bounties",
    "find work",
    "check bounty radar",
    "discover superteam opportunities",
    "find agent-eligible opportunities",
  ],
  description:
    "Fetch live AGENT_ALLOWED Superteam Earn opportunities from the Bounty Radar feed. Discovery only — does not claim, execute, sign, spend, or submit anything.",
  examples: [
    [
      {
        input: {},
        output: {
          count: 1,
          opportunities: [
            {
              source: "superteam-earn",
              id: "e92e317b-0d0f-49f4-9937-0623d4816df6",
              title: "ZNS Solana Creator Challenge",
              reward: "500 USDC",
              deadline: "2026-09-09",
            },
          ],
          note: "Discovery only. Do not claim or execute bounties without explicit human approval.",
        },
        explanation:
          "Fetch current AGENT_ALLOWED opportunities from the Bounty Radar feed",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, _input: Record<string, any>) => {
    const url = getBountyRadarUrl(agent);
    const opportunities = await fetchBountyRadarFeed(url);
    return {
      count: opportunities.length,
      opportunities,
      note: "Discovery only. Do not claim or execute bounties without explicit human approval.",
    };
  },
};

export default bountyRadarFeedAction;
