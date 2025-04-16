import { runEvals } from "../utils/runEvals";

const ORCA_CLOSE_POSITION_DATASET = [
  {
    inputs: {
      query:
        "Close my orca position with mint address 5exCqNgmw8sXrNjf5tc52KoG498E7pGf1qX72e97ugfg",
    },
    referenceOutputs: {
      tool: "orca_close_position",
      response: JSON.stringify({
        positionMintAddress: "5exCqNgmw8sXrNjf5tc52KoG498E7pGf1qX72e97ugfg",
      }),
    },
  },
];

runEvals(ORCA_CLOSE_POSITION_DATASET, "orca_close_position eval");