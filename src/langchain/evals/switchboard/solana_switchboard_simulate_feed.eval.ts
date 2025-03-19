import { runEvals } from "../utils/runEvals";

const SWITCHBOARD_SIMULATE_FEED_DATASET = [
  {
    inputs: {
      query: "Simulate feed by pubkey F1Gf4opc3qWYh19nR3C8Ry2uo33ZqMSrDfAmvWEz4A3W"
    },
    referenceOutputs: {
      tool: "switchboard_simulate_feed",
      response: JSON.stringify({
        feed: "F1Gf4opc3qWYh19nR3C8Ry2uo33ZqMSrDfAmvWEz4A3W"
      }),
    },
  },
];

runEvals(SWITCHBOARD_SIMULATE_FEED_DATASET, "solana_switchboard_simulate_feed eval");