import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn NFT collection deployment",
    inputs: {
      query: "I want to deploy an NFT collection",
    },
    turns: [
      { input: "I want to deploy an NFT collection" },
      { input: "The collection should be named MyCollection" },
      {
        input:
          "Its metadata URI is https://metadata.mycoll.io/collection.json. Set the royalty to 250 basis points",
        expectedToolCall: {
          tool: "solana_deploy_collection",
          params: {
            name: "MyCollection",
            uri: "https://metadata.mycoll.io/collection.json",
            royaltyBasisPoints: 250,
          },
        },
      },
      {
        input: "Also, retrieve the deployed collection details",
        expectedToolCall: {
          tool: "get_asset",
          params: { collection: "MyCollection" },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn solana_deploy_collection test");
