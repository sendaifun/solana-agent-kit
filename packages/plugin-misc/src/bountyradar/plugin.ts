import type { Plugin, SolanaAgentKit } from "solana-agent-kit";
import bountyRadarFeedAction from "./actions/bountyRadarFeed";

export interface BountyRadarPluginOptions {
  bountyRadarUrl: string;
}

const options: Partial<BountyRadarPluginOptions> = {};

export function configureBountyRadar(opts: BountyRadarPluginOptions) {
  options.bountyRadarUrl = opts.bountyRadarUrl;
}

/** Resolve the Bounty Radar URL from config > env > configureBountyRadar. */
export function getBountyRadarUrl(_agent: SolanaAgentKit): string {
  const fromConfig = (_agent.config as any)?.BOUNTY_RADAR_URL;
  const fromEnv = process.env.BOUNTY_RADAR_URL;
  const resolved = fromConfig ?? fromEnv ?? options.bountyRadarUrl;
  if (!resolved) {
    throw new Error(
      "BOUNTY_RADAR_URL is not set. Provide it via agent config, BOUNTY_RADAR_URL env var, or configureBountyRadar().",
    );
  }
  return resolved;
}

export const BountyRadarPlugin: Plugin = {
  name: "bounty-radar",
  methods: {},
  actions: [bountyRadarFeedAction],
  initialize(_agent: SolanaAgentKit) {
    // no initialization required — URL is resolved lazily at call time
  },
};

export default BountyRadarPlugin;
