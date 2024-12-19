import { SolanaAgentKit } from "../index";
import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { create, mplCore } from '@metaplex-foundation/mpl-core';
import { fetchCollection } from '@metaplex-foundation/mpl-core';
import { PublicKey } from "@solana/web3.js";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { MintCollectionNFTResponse } from '../types';

/**
 * Mint a new NFT as part of an existing collection
 * @param agent SolanaAgentKit instance
 * @param collectionMint Address of the collection's master NFT
 * @param metadata NFT metadata object
 * @param recipient Optional recipient address (defaults to wallet address)
 * @returns Object containing NFT mint address and token account
 */
export async function mintCollectionNFT(
  agent: SolanaAgentKit,
  collectionMint: PublicKey,
  metadata: {
    name: string;
    uri: string;
    sellerFeeBasisPoints?: number;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  },
  recipient?: PublicKey
): Promise<MintCollectionNFTResponse> {
  try {
    // Create UMI instance from agent
    const umi = createUmi(agent.connection.rpcEndpoint).use(mplCore());
    umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    // Convert collection mint to UMI format
    const umiCollectionMint = fromWeb3JsPublicKey(collectionMint);

    // Fetch the existing collection
    const collection = await fetchCollection(umi, umiCollectionMint);

    // Generate a new signer for the NFT
    const assetSigner = generateSigner(umi);

    // Create the NFT in the collection
    await create(umi, {
      asset: assetSigner,
      collection: collection,
      name: metadata.name,
      uri: metadata.uri,
      owner: fromWeb3JsPublicKey(recipient ?? agent.wallet.publicKey)
    }).sendAndConfirm(umi);

    return {
      mint: toWeb3JsPublicKey(assetSigner.publicKey),
      // Note: Token account is now handled automatically by the create instruction
      metadata: toWeb3JsPublicKey(assetSigner.publicKey)
    };
  } catch (error: any) {
    throw new Error(`Collection NFT minting failed: ${error.message}`);
  }
}