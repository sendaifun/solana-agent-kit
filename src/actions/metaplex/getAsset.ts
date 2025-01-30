import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { get_asset } from "../../tools/metaplex";

const getAssetAction: Action = {
  name: "GET_ASSET",
  similes: [
    "fetch asset",
    "retrieve asset",
    "get asset details",
    "fetch asset details",
  ],
  description: `Fetch asset details using the Metaplex DAS API.`,
  examples: [
    [
      {
        input: {
          assetId: "Asset ID",
        },
        output: {
          status: "success",
          message: "Asset retrieved successfully",
          result: {
            // Example asset details
            name: "Example Asset",
            symbol: "EXA",
            uri: "https://example.com/asset.json",
          },
        },
        explanation: "Fetch details of an asset using its ID",
      },
    ],
  ],
  schema: z.object({
    assetId: z.string().min(1, "Asset ID is required"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const assetId = input.assetId;

    const result = await get_asset(agent, assetId);

    return {
      status: "success",
      message: "Asset retrieved successfully",
      result,
    };
  },
};

export default getAssetAction;
