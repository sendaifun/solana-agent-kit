import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { SwitchboardSimulateFeedResponse } from "../../index";

export class SolanaSwitchboardSimulateFeed extends Tool {
  name = "switchboard_simulate_feed";
  description = `Simluates a Switchboard price feed given the feed's public key.
  Input should be a JSON string with the following format:
  {
    "feed": string (required) - the public key (a.k.a. feed hash) of the feed to simulate
    "crossbarUrl": string (optional) - the url of the crossbar instance to use. Defaults to "https://crossbar.switchboard.xyz"
  }
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const InputFormat = JSON.parse(input);
      const feed = InputFormat.feed;
      const crossbarUrl = InputFormat.crossbarUrl;

      const value = await this.solanaKit.simulateSwitchboardFeed(
        feed,
        crossbarUrl,
      );

      const response: SwitchboardSimulateFeedResponse = {
        status: "success",
        feed,
        value: Number.parseInt(value),
      };

      return JSON.stringify(response);
    } catch (error: any) {
      const response: SwitchboardSimulateFeedResponse = {
        status: "error",
        message: error.message,
        code: error.code,
      };
      return JSON.stringify(response);
    }
  }
}
