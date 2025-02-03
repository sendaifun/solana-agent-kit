import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { get_assets_by_authority } from "../../tools/metaplex";

const getAssetsByAuthorityAction: Action = {
  name: "GET_ASSETS_BY_AUTHORITY",
  similes: [
    "fetch assets by authority",
    "retrieve assets by authority",
    "get assets by authority address",
    "fetch authority assets",
  ],
  description: `Fetch a list of assets owned by a specific address using the Metaplex DAS API.`,
  examples: [
    [
      {
        input: {
          authority: "mRdta4rc2RtsxEUDYuvKLamMZAdW6qHcwuq866Skxxv",
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
        explanation: "Fetch a list of assets owned by a specific address",
      },
    ],
  ],
  schema: z.object({
    authority: z.string().min(1, "Authority address is required"),
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
    input: z.infer<typeof getAssetsByAuthorityAction.schema>,
  ) => {
    const result = await get_assets_by_authority(agent, input);

    return {
      status: "success",
      message: "Assets retrieved successfully",
      result,
    };
  },
};

export default getAssetsByAuthorityAction;
