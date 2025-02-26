import { signOrSendTX, SolanaAgentKit } from "solana-agent-kit";
import { generateSigner } from "@metaplex-foundation/umi";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { fetchCollection } from "@metaplex-foundation/mpl-core";
import { PublicKey } from "@solana/web3.js";
import {
  fromWeb3JsPublicKey,
  toWeb3JsLegacyTransaction,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

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
  recipient?: PublicKey,
) {
  try {
    // Create UMI instance from agent
    const umi = createUmi(agent.connection.rpcEndpoint).use(mplCore());
    // umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    // Convert collection mint to UMI format
    const umiCollectionMint = fromWeb3JsPublicKey(collectionMint);

    // Fetch the existing collection
    const collection = await fetchCollection(umi, umiCollectionMint);

    // Generate a new signer for the NFT
    const assetSigner = generateSigner(umi);

    const tx = create(umi, {
      asset: assetSigner,
      collection: collection,
      name: metadata.name,
      uri: metadata.uri,
      owner: fromWeb3JsPublicKey(recipient ?? agent.wallet.publicKey),
    }).build(umi);

    const compatibleTx = toWeb3JsLegacyTransaction(tx);
    compatibleTx.feePayer = agent.wallet.publicKey;

    if (agent.config.signOnly) {
      return {
        mint: toWeb3JsPublicKey(assetSigner.publicKey),
        // Note: Token account is now handled automatically by the create instruction
        metadata: toWeb3JsPublicKey(assetSigner.publicKey),
        signedTransaction: await agent.wallet.signTransaction(compatibleTx),
      };
    }

    const { blockhash } = await agent.connection.getLatestBlockhash();
    compatibleTx.recentBlockhash = blockhash;

    await signOrSendTX(agent, compatibleTx);

    return {
      mint: toWeb3JsPublicKey(assetSigner.publicKey),
      // Note: Token account is now handled automatically by the create instruction
      metadata: toWeb3JsPublicKey(assetSigner.publicKey),
      signature: bs58.encode(compatibleTx.signature!),
    };
  } catch (error: any) {
    throw new Error(`Collection NFT minting failed: ${error.message}`);
  }
}
