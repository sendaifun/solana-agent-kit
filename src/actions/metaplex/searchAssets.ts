import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { search_assets } from "../../tools/metaplex";
import { publicKey } from "@metaplex-foundation/umi";

const searchAssetsAction: Action = {
  name: "SEARCH_ASSETS",
  similes: ["search assets", "find assets", "lookup assets", "query assets"],
  description: `Search for assets using various criteria with the Metaplex DAS API.`,
  examples: [
    [
      {
        input: {
          owner: publicKey("N4f6zftYsuu4yT7icsjLwh4i6pB1zvvKbseHj2NmSQw"),
          jsonUri:
            "https://arweave.net/c9aGs5fOk7gD4wWnSvmzeqgtfxAGRgtI1jYzvl8-IVs/chiaki-violet-azure-common.json",
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
        explanation: "Search for assets using various criteria",
      },
    ],
  ],
  schema: z.object({
    negate: z.boolean().optional(),
    conditionType: z.enum(["all", "any"]).optional(),
    interface: z.string().optional(),
    jsonUri: z.string().optional(),
    owner: z.string().optional(),
    ownerType: z.enum(["single", "token"]).optional(),
    creator: z.string().optional(),
    creatorVerified: z.boolean().optional(),
    authority: z.string().optional(),
    grouping: z.tuple([z.string(), z.string()]).optional(),
    delegate: z.string().optional(),
    frozen: z.boolean().optional(),
    supply: z.number().optional(),
    supplyMint: z.string().optional(),
    compressed: z.boolean().optional(),
    compressible: z.boolean().optional(),
    royaltyModel: z.enum(["creators", "fanout", "single"]).optional(),
    royaltyTarget: z.string().optional(),
    royaltyAmount: z.number().optional(),
    burnt: z.boolean().optional(),
    limit: z.number().optional(),
    page: z.number().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
  }),
  handler: async (
    agent: SolanaAgentKit,
    input: z.infer<typeof searchAssetsAction.schema>,
  ) => {
    const result = await search_assets(agent, input);

    return {
      status: "success",
      message: "Assets retrieved successfully",
      result,
    };
  },
};

export default searchAssetsAction;
