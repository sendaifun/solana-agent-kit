import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { get_assets_by_creator } from "../../tools/metaplex";

const getAssetsByCreatorAction: Action = {
  name: "GET_ASSETS_BY_CREATOR",
  similes: [
    "fetch assets by creator",
    "retrieve assets by creator",
    "get assets by creator address",
    "fetch creator assets",
  ],
  description: `Fetch a list of assets created by a specific address using the Metaplex DAS API.`,
  examples: [
    [
      {
        input: {
          creator: "D3XrkNZz6wx6cofot7Zohsf2KSsu2ArngNk8VqU9cTY3",
          onlyVerified: true,
          limit: 10,
        },
        output: {
          status: "success",
          message: "Assets retrieved successfully",
          result: {
            total: 2,
            limit: 10,
            items: [
              {
                interface: "V1_NFT",
                id: "ExampleAssetId1",
                content: {
                  json_uri: "https://example.com/asset1.json",
                  metadata: {
                    name: "Example Asset 1",
                    symbol: "EXA1",
                  },
                },
                authorities: [],
                compression: {},
                grouping: [],
                royalty: {},
                creators: [],
                ownership: {},
                supply: {},
                mutable: true,
                burnt: false,
              },
              {
                interface: "V1_NFT",
                id: "ExampleAssetId2",
                content: {
                  json_uri: "https://example.com/asset2.json",
                  metadata: {
                    name: "Example Asset 2",
                    symbol: "EXA2",
                  },
                },
                authorities: [],
                compression: {},
                grouping: [],
                royalty: {},
                creators: [],
                ownership: {},
                supply: {},
                mutable: true,
                burnt: false,
              },
            ],
          },
        },
        explanation: "Fetch a list of assets created by a specific address",
      },
    ],
  ],
  schema: z.object({
    creator: z.string().min(1, "Creator address is required"),
    onlyVerified: z.boolean(),
    sortBy: z
      .object({
        sortBy: z.enum(["created", "updated", "recentAction", "none"]),
        sortDirection: z.enum(["asc", "desc"]),
      })
      .optional(),
    limit: z.number().optional(),
    page: z.number().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
  }),
  handler: async (
    agent: SolanaAgentKit,
    input: z.infer<typeof getAssetsByCreatorAction.schema>,
  ) => {
    const result = await get_assets_by_creator(agent, input);

    return {
      status: "success",
      message: "Assets retrieved successfully",
      result,
    };
  },
};

export default getAssetsByCreatorAction;
