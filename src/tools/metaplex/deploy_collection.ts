import { SolanaAgentKit } from "../../index";
import {
  generateSigner,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  createCollection,
  mplCore,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import { CollectionOptions, CollectionDeployment } from "../../types";
import {
  fromWeb3JsKeypair,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

/**
 * Deploy a new NFT collection
 * @param agent SolanaAgentKit instance
 * @param options Collection options including name, URI, royalties, and creators
 * @returns Object containing collection address and metadata
 */
export async function deploy_collection(
  agent: SolanaAgentKit,
  options: CollectionOptions,
): Promise<CollectionDeployment> {
  try {
    // Initialize Umi
    const umi = createUmi(agent.connection.rpcEndpoint).use(mplCore());
    umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    // Generate collection signer
    const collectionSigner = generateSigner(umi);

    // Format creators if provided
    const formattedCreators = options.creators?.map((creator) => ({
      address: publicKey(creator.address),
      percentage: creator.percentage,
    })) || [
      {
        address: publicKey(agent.wallet_address.toString()),
        percentage: 100,
      },
    ];

    // Create collection
    const tx = await createCollection(umi, {
      collection: collectionSigner,
      name: options.name,
      uri: options.uri,
      plugins: [
        {
          type: "Royalties",
          basisPoints: options.royaltyBasisPoints || 500, // Default 5%
          creators: formattedCreators,
          ruleSet: ruleSet("None"), // Compatibility rule set
        },
      ],
    }).sendAndConfirm(umi);

    return {
      collectionAddress: toWeb3JsPublicKey(collectionSigner.publicKey),
      signature: tx.signature,
    };
  } catch (error: any) {
    throw new Error(`Collection deployment failed: ${error.message}`);
  }
}
