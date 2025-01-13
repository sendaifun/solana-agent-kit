import { createCollectionImp, createSingleImp } from "@3land/listings-sdk";
import {
  StoreInitOptions,
  CreateCollectionOptions,
  CreateSingleOptions,
} from "@3land/listings-sdk/dist/types/implementation/implementationTypes";

/**
 * Create a collection on 3Land
 * @param optionsWithBase58 represents the privateKey of the wallet - can be an array of numbers, Uint8Array or base58 string
 * @param collectionOpts represents the options for the collection creation
 * @returns
 */
export async function createCollection(
  optionsWithBase58: StoreInitOptions,
  collectionOpts: CreateCollectionOptions,
) {
  try {
    const collection = await createCollectionImp(
      optionsWithBase58,
      collectionOpts,
    );
    return collection;
  } catch (error: any) {
    throw new Error(`Collection creation failed: ${error.message}`);
  }
}

/**
 * Create a single edition on 3Land
 * @param optionsWithBase58 represents the privateKey of the wallet - can be an array of numbers, Uint8Array or base58 string
 * @param collectionAccount represents the account for the nft collection
 * @param createItemOptions the options for the creation of the single NFT listing
 * @returns
 */
export async function createSingle(
  optionsWithBase58: StoreInitOptions,
  collectionAccount: string,
  createItemOptions: CreateSingleOptions,
  isMainnet: boolean,
) {
  try {
    const landStore = isMainnet
      ? "AmQNs2kgw4LvS9sm6yE9JJ4Hs3JpVu65eyx9pxMG2xA"
      : "GyPCu89S63P9NcCQAtuSJesiefhhgpGWrNVJs4bF2cSK";

    const singleEditionTx = await createSingleImp(
      optionsWithBase58,
      landStore,
      collectionAccount,
      createItemOptions,
    );
    return singleEditionTx;
  } catch (error: any) {
    throw new Error(`Single edition creation failed: ${error.message}`);
  }
}

/**
 * Buy a single edition on 3Land
 * @param
 * @returns
 */
// export async function buySingle() {
//   try {
//   } catch (error: any) {
//     throw new Error(`Buying single edition failed: ${error.message}`);
//   }
// }
