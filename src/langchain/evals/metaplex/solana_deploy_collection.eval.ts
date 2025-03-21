import { runEvals } from "../utils/runEvals";

const DEPLOY_COLLECTION_DATASET = [
  {
    inputs: {
      query:
        "Deploy an NFT collection named MyCollection with uri https://metadata.mycoll.io/collection.json, plus 250 royalty bps"
    },
    referenceOutputs: {
      tool: "solana_deploy_collection",
      response: JSON.stringify({
        name: "MyCollection",
        uri: "https://metadata.mycoll.io/collection.json",
        royaltyBasisPoints: 250
      }),
    },
  },
];

runEvals(DEPLOY_COLLECTION_DATASET, "solana_deploy_collection eval");