import { runEvals } from "../utils/runEvals";

const MINT_NFT_DATASET = [
  {
    inputs: {
      query:
        "Mint me an NFT into the collection 7ARsDF1Z4Cp36JuWXXsQGZMG8xyey56WYN8gjgZQeCQq named 'Cool NFT' with uri https://nftstorage.net/cool.json"
    },
    referenceOutputs: {
      tool: "solana_mint_nft",
      response: JSON.stringify({
        collectionMint: "7ARsDF1Z4Cp36JuWXXsQGZMG8xyey56WYN8gjgZQeCQq",
        name: "Cool NFT",
        uri: "https://nftstorage.net/cool.json"
      }),
    },
  },
  {
    inputs: {
      query:
        "Create an NFT in the collection 51ZdVLQjVRjyM1PYaRMYFrog2fw9HaA4gmJx4BvKaoK2, named HelloWorldNFT with metadata at https://example.org/hwnft.json, send to 5vCk9eeWppZQYyNv4vz8x5uGZe7GAH2Vo76DvHzeN5Vh"
    },
    referenceOutputs: {
      tool: "solana_mint_nft",
      response: JSON.stringify({
        collectionMint: "51ZdVLQjVRjyM1PYaRMYFrog2fw9HaA4gmJx4BvKaoK2",
        name: "HelloWorldNFT",
        uri: "https://example.org/hwnft.json",
        recipient: "5vCk9eeWppZQYyNv4vz8x5uGZe7GAH2Vo76DvHzeN5Vh"
      }),
    },
  },
];

runEvals(MINT_NFT_DATASET, "solana_mint_nft eval");