import { runEvals } from "../utils/runEvals";

const THREELAND_CREATE_SINGLE_DATASET = [
  {
    inputs: {
      query: `Create an NFT single listing in the collection EAKm4 with name 'Artz', itemSymbol 'ART', itemAmount=10, price=1.5 SOL, traits=[{trait_type:'color', value:'blue'}], isMainnet=false, withPool=true, poolName='myPool', splHash='So11111111111111111111111111111111111111112'`
    },
    referenceOutputs: {
      tool: "3land_minting_tool_single",
      response: JSON.stringify({
        collectionAccount: "EAKm4",
        itemName: "Artz",
        itemSymbol: "ART",
        itemAmount: 10,
        itemDescription: "",
        traits: [{ trait_type: "color", value: "blue" }],
        price: 1.5,
        mainImageUrl: "",
        isMainnet: false,
        withPool: true,
        poolName: "myPool",
        splHash: "So11111111111111111111111111111111111111112"
      }),
    },
  },
];

runEvals(THREELAND_CREATE_SINGLE_DATASET, "3land_minting_tool_single eval");