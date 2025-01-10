import {
  StoreInitOptions,
  CreateSingleOptions,
  CreateCollectionOptions,
} from "@3land/listings-sdk/dist/types/implementation/implementationTypes";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class Solana3LandCreateSingle extends Tool {
  name = "3land_minting_tool";
  description = `Creates an NFT and lists it on 3.land's website
  
    Inputs:
    privateKey (required): represents the privateKey of the wallet - can be an array of numbers, Uint8Array or base58 string
    collectionAccount (optional): represents the account for the nft collection
    itemName (required): the name of the NFT
    sellerFee (required): the fee of the seller
    itemAmount (required): the amount of the NFTs that can be minted
    itemDescription (required): the description of the NFT
    traits (required): the traits of the NFT [{trait_type: string, value: string}]
    price (required): the price of the item, if is 0 the listing will be free
    mainImageUrl (required): the main image of the NFT
    coverImageUrl (optional): the cover image of the NFT
    splHash (optional): the hash of the spl token, if not provided listing will be in $SOL
    isMainnet (required): defines is the tx takes places in mainnet
    `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const privateKey = inputFormat.privateKey;
      const isMainnet = inputFormat.isMainnet;

      const optionsWithBase58: StoreInitOptions = {
        ...(privateKey && { privateKey }),
        ...(isMainnet && { isMainnet }),
      };

      const collectionAccount = inputFormat.collectionAccount;

      const itemName = inputFormat?.itemName;
      const sellerFee = inputFormat?.sellerFee;
      const itemAmount = inputFormat?.itemAmount;
      const itemSymbol = inputFormat?.itemSymbol;
      const itemDescription = inputFormat?.itemDescription;
      const traits = inputFormat?.traits;
      const price = inputFormat?.price;
      const mainImageUrl = inputFormat?.mainImageUrl;
      const coverImageUrl = inputFormat?.coverImageUrl;
      const splHash = inputFormat?.splHash;

      const createItemOptions: CreateSingleOptions = {
        ...(itemName && { itemName }),
        ...(sellerFee && { sellerFee }),
        ...(itemAmount && { itemAmount }),
        ...(itemSymbol && { itemSymbol }),
        ...(itemDescription && { itemDescription }),
        ...(traits && { traits }),
        ...(price && { price }),
        ...(mainImageUrl && { mainImageUrl }),
        ...(coverImageUrl && { coverImageUrl }),
        ...(splHash && { splHash }),
      };

      if (!collectionAccount) {
        throw new Error("Collection account is required");
      }

      const tx = await this.solanaKit.create3LandNft(
        optionsWithBase58,
        collectionAccount,
        createItemOptions,
        isMainnet,
      );
      return JSON.stringify({
        status: "success",
        message: `Created listing successfully ${tx}`,
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class Solana3LandCreateCollection extends Tool {
  name = "3land_minting_tool";
  description = `Creates an NFT Collection that you can visit on 3.land's website (3.land/collection/{collectionAccount})
    
    Inputs:
    privateKey (required): represents the privateKey of the wallet - can be an array of numbers, Uint8Array or base58 string
    isMainnet (required): defines is the tx takes places in mainnet
    collectionSymbol (required): the symbol of the collection
    collectionName (required): the name of the collection
    collectionDescription (required): the description of the collection
    mainImageUrl (required): the image of the collection
    coverImageUrl (optional): the cover image of the collection
    `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const privateKey = inputFormat.privateKey;
      const isMainnet = inputFormat.isMainnet;

      const optionsWithBase58: StoreInitOptions = {
        ...(privateKey && { privateKey }),
        ...(isMainnet && { isMainnet }),
      };

      const collectionSymbol = inputFormat?.collectionSymbol;
      const collectionName = inputFormat?.collectionName;
      const collectionDescription = inputFormat?.collectionDescription;
      const mainImageUrl = inputFormat?.mainImageUrl;
      const coverImageUrl = inputFormat?.coverImageUrl;

      const collectionOpts: CreateCollectionOptions = {
        ...(collectionSymbol && { collectionSymbol }),
        ...(collectionName && { collectionName }),
        ...(collectionDescription && { collectionDescription }),
        ...(mainImageUrl && { mainImageUrl }),
        ...(coverImageUrl && { coverImageUrl }),
      };

      const tx = await this.solanaKit.create3LandCollection(
        optionsWithBase58,
        collectionOpts,
      );
      return JSON.stringify({
        status: "success",
        message: `Created Collection successfully ${tx}`,
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
