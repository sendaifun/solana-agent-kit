import type { Plugin } from "solana-agent-kit";

// Import Metaplex actions
import deployCollectionAction from "./metaplex/actions/deployCollection";
import deployTokenAction from "./metaplex/actions/deployToken";
import deployToken2022Action from "./metaplex/actions/deployToken2022";
import getAssetAction from "./metaplex/actions/getAsset";
import getAssetsByAuthorityAction from "./metaplex/actions/getAssetsByAuthority";
import getAssetsByCreatorAction from "./metaplex/actions/getAssetsByCreator";
import mintNFTAction from "./metaplex/actions/mintNFT";
import searchAssetsAction from "./metaplex/actions/searchAssets";

// Import Tensor actions
import {
  cancelNFTListingAction,
  listNFTForSaleAction,
} from "./tensor/actions/tensorTrade";

// Import 3Land actions
import create3LandCollectibleAction from "./3land/actions/create3LandCollectibleAction";

// Import Magic Eden actions
import getMagicEdenCollectionStatsAction from "./magiceden/actions/getCollectionStats";
import getMagicEdenPopularCollectionsAction from "./magiceden/actions/getPopularCollections";
import listNFTOnMagicEdenAction from "./magiceden/actions/listNFT";
import bidOnMagicEdenNFTAction from "./magiceden/actions/bidOnNFT";
import getMagicEdenCollectionListingsAction from "./magiceden/actions/getCollectionListings";

// Import Metaplex tools
import {
  deploy_collection,
  deploy_token,
  deploy_token2022,
  get_asset,
  get_assets_by_authority,
  get_assets_by_creator,
  mintCollectionNFT,
} from "./metaplex/tools";

// Import Tensor tools
import { cancelListing, listNFTForSale } from "./tensor/tools/tensor_trade";

// Import 3Land tools
import {
  createCollection,
  createSingle,
} from "./3land/tools/create_3land_collectible";
import { search_assets } from "./metaplex/tools/search_assets";

// Import Magic Eden tools
import {
  bid_on_magiceden_nft,
  get_magiceden_collection_listings,
  get_magiceden_collection_stats,
  get_magiceden_popular_collections,
  list_nft_on_magiceden,
} from "./magiceden/tools";

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
    deployToken2022: deploy_token2022,

    // Tensor methods
    listNFTForSale,
    cancelListing,

    // 3Land methods
    create3LandCollection: createCollection,
    create3LandSingle: createSingle,

    // Magic Eden methods
    getMagicEdenCollectionStats: get_magiceden_collection_stats,
    getMagicEdenPopularCollections: get_magiceden_popular_collections,
    listNFTOnMagicEden: list_nft_on_magiceden,
    bidOnMagicEdenNFT: bid_on_magiceden_nft,
    getMagicEdenCollectionListings: get_magiceden_collection_listings,
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
    deployToken2022Action,

    // // Tensor actions
    listNFTForSaleAction,
    cancelNFTListingAction,

    // 3Land actions
    create3LandCollectibleAction,

    // Magic Eden actions
    getMagicEdenCollectionStatsAction,
    getMagicEdenPopularCollectionsAction,
    listNFTOnMagicEdenAction,
    bidOnMagicEdenNFTAction,
    getMagicEdenCollectionListingsAction,
  ],

  // Initialize function
  initialize: function (): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

// Default export for convenience
export default NFTPlugin;
