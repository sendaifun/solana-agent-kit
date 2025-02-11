import { z } from "zod";
import type { Action } from "../../types";
import { orcaFetchPositions } from "../../tools";

const fetchOrcaPositionsAction: Action = {
  name: "FETCH_ORCA_POSITIONS_ACTION",
  description:
    "Fetch all the liquidity positions in an Orca Whirlpool by owner. Returns an object with position mint addresses as keys and position status details as values.",
  similes: [
    "fetch orca liquidity positions",
    "fetch orca whirlpool positions",
    "fetch orca liquidity pools",
    "fetch my orca liquidity positions",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Liquidity positions fetched.",
          positions: {
            positionMintAddress1: {
              whirlpoolAddress: "whirlpoolAddress1",
              positionInRange: true,
              distanceFromCenterBps: 250,
            },
          },
        },
        explanation: "Fetch all Orca whirlpool positions",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent) => {
    try {
      const positions = JSON.parse(await orcaFetchPositions(agent));

      return {
        status: "success",
        message: "Liquidity positions fetched.",
        positions,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - TS doesn't know that `e` has a `message` property
        message: `Failed to fetch Orca whirlpool positions: ${e.message}`,
      };
    }
  },
};

export default fetchOrcaPositionsAction;
