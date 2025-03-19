import { runEvals } from "../utils/runEvals";

const THREELAND_CREATE_COLLECTION_DATASET = [
  {
    inputs: {
      query: `Create a 3.land NFT collection named 'My3LandCollection' with symbol=3LD, description='test desc', mainnet=false`
    },
    referenceOutputs: {
      tool: "3land_minting_tool_collection",
      response: JSON.stringify({
        isMainnet: false,
        collectionSymbol: "3LD",
        collectionName: "My3LandCollection",
        collectionDescription: "test desc",
        mainImageUrl: ""
      }),
    },
  },
];

runEvals(THREELAND_CREATE_COLLECTION_DATASET, "3land_minting_tool_collection eval");