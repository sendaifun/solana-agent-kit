import {
  CreateCollectionOptions,
  CreateSingleOptions,
  StoreInitOptions,
} from "@3land/listings-sdk/dist/types/implementation/implementationTypes";

import "dotenv/config";
import { SolanaAgentKit, createSolanaTools } from "../../src";

const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
);

const isDevnet = true;

/****************************** CREATING COLLECTION ******************************** */

const collectionOpts: CreateCollectionOptions = {
  collectionName: "",
  collectionSymbol: "",
  collectionDescription: "",
  mainImageUrl: "",
};

(async () => {
  const collection = await agent.create3LandCollection(
    collectionOpts,
    isDevnet,
  );

  console.log("collection: ", collection);
})();

/****************************** CREATING NFT ******************************** */
const collectionAccount = "";
const createItemOptions: CreateSingleOptions = {
  itemName: "",
  sellerFee: 500, //5%
  itemAmount: 333,
  itemSymbol: "",
  itemDescription: "",
  traits: [{ trait_type: "", value: "" }],
  price: 100000000, //100000000 == 0.1 sol,
  splHash: "",
  poolName: "",
  mainImageUrl: "",
};

const withPool = true;

(async () => {
  const result = agent.create3LandNft(
    collectionAccount,
    createItemOptions,
    isDevnet,
    withPool,
  );
  console.log("result: ", result);
})();

export { SolanaAgentKit, createSolanaTools };
