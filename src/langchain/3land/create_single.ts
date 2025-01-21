import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { CreateSingleOptions } from "@3land/listings-sdk/dist/types/implementation/implementationTypes";

export class Solana3LandCreateSingle extends Tool {
  name = "3land_minting_tool";
  description = `Creates an NFT and lists it on 3.land's website

  Inputs:
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
  poolName (optional): the name of the pool
  isMainnet (required): defines if the tx takes places in mainnet
  withPool (optional): defines if minted edition will be tied to a liquidity pool
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const isMainnet = inputFormat.isMainnet;
      const withPool = inputFormat.withPool;
      const poolName = inputFormat.poolName;

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

      if (withPool) {
        if (!poolName) {
          throw new Error("poolName is required when withPool is true");
        }
        if (!splHash) {
          throw new Error("splHash is required when withPool is true");
        }
      }

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
        ...(poolName && { poolName }),
      };

      if (!collectionAccount) {
        throw new Error("Collection account is required");
      }

      const tx = await this.solanaKit.create3LandNft(
        collectionAccount,
        createItemOptions,
        !isMainnet,
        withPool,
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
