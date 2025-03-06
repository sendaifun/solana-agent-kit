import { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import Metaplex actions
import deployCollectionAction from "./metaplex/actions/deployCollection";
import deployTokenAction from "./metaplex/actions/deployToken";
import getAssetAction from "./metaplex/actions/getAsset";
import getAssetsByAuthorityAction from "./metaplex/actions/getAssetsByAuthority";
import getAssetsByCreatorAction from "./metaplex/actions/getAssetsByCreator";
import mintNFTAction from "./metaplex/actions/mintNFT";
import searchAssetsAction from "./metaplex/actions/searchAssets";

// Import Tensor actions
import {
  listNFTForSaleAction,
  cancelNFTListingAction,
} from "./tensor/actions/tensorTrade";

// Import 3Land actions
import create3LandCollectibleAction from "./3land/actions/create3LandCollectibleAction";

// Import Metaplex tools
import {
  deploy_collection,
  deploy_token,
  get_asset,
  get_assets_by_authority,
  get_assets_by_creator,
  mintCollectionNFT,
} from "./metaplex/tools";

// Import Tensor tools
import { listNFTForSale, cancelListing } from "./tensor/tools/tensor_trade";

// Import 3Land tools
import {
  createCollection,
  createSingle,
} from "./3land/tools/create_3land_collectible";
import { search_assets } from "./metaplex/tools/search_assets";

// Define and export the plugin
const NFTPlugin = {
  name: "nft",

  // Combine all tools
  methods: {
    // Metaplex methods
    deployCollection: deploy_collection,
    deployToken: deploy_token,
    getAsset: get_asset,
    getAssetsByAuthority: get_assets_by_authority,
    getAssetsByCreator: get_assets_by_creator,
    mintCollectionNFT: mintCollectionNFT,
    searchAssets: search_assets,

    // Tensor methods
    listNFTForSale,
    cancelListing,

    // 3Land methods
    create3LandCollection: createCollection,
    create3LandSingle: createSingle,
  },

  // Combine all actions
  actions: [
    // Metaplex actions
    deployCollectionAction,
    deployTokenAction,
    getAssetAction,
    getAssetsByAuthorityAction,
    getAssetsByCreatorAction,
    mintNFTAction,
    searchAssetsAction,

    // // Tensor actions
    listNFTForSaleAction,
    cancelNFTListingAction,

    // 3Land actions
    create3LandCollectibleAction,
  ],

  // Initialize function
  initialize: function (agent: SolanaAgentKit): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method.bind(null, agent);
      }
    });

    // Any necessary initialization logic
    if (!agent.config.OPENAI_API_KEY) {
      console.warn("Warning: OPENAI_API_KEY not provided in config");
    }
  },
} satisfies Plugin;

// Default export for convenience
export = NFTPlugin;
