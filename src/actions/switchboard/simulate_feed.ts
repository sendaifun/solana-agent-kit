import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { simulate_switchboard_feed } from "../../tools";
import { SWITCHBOARD_DEFAULT_CROSSBAR } from "../../constants";

const switchboardSimulateFeedAction: Action = {
  name: "SWITCHBOARD_SIMULATE_FEED",
  similes: [
    "simulate switchboard price feed",
    "simulate switchboard feed",
    "switchboard oracle feed",
    "get switchboard price",
    "check switchboard price",
    "switchboard price",
    "switchbaord feed",
  ],
  description:
    "Simulates a given switchboard price feed and returns the value.",
  examples: [
    [
      {
        input: {
          feed: "6qmsMwtMmeqMgZEhyLv1Pe4wcqT5iKwJAWnmzmnKjf83", // BTC/USDT price feed
        },
        output: {
          status: "success",
          value: "104097.59",
          message: "Simulation result: 104097.59",
        },
        explanation:
          "Get the current BTC/USDT price by simulating a Switchbaord feed",
      },
    ],
  ],
  schema: z.object({
    feed: z
      .string()
      .describe("The address of the Switchboard feed to simulate"),
    crossbarUrl: z
      .string()
      .default(SWITCHBOARD_DEFAULT_CROSSBAR)
      .describe("The url of the crossbar server to use"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { feedAddress, crossbarUrl } = input;
      const result = await simulate_switchboard_feed(feedAddress, crossbarUrl);
      return {
        status: "success",
        feed: feedAddress,
        message: `Simulation result: ${result}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to simulate Switchboard feed: ${error.message}`,
      };
    }
  },
};

export default switchboardSimulateFeedAction;
