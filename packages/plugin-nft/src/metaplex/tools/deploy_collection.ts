import { createCollection, ruleSet } from "@metaplex-foundation/mpl-core";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import {
  toWeb3JsInstruction,
  toWeb3JsKeypair,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { Transaction, type PublicKey } from "@solana/web3.js";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { initUmi } from "../../utils";
import type { CollectionOptions } from "../types";

interface DeployCollectionResponse {
  collectionAddress: PublicKey;
  signature?: string;
  signedTransaction?: Awaited<ReturnType<typeof signOrSendTX>>;
}

/**
 * Deploy a new NFT collection
 * @param agent SolanaAgentKit instance
 * @param options Collection options including name, URI, royalties, and creators
 * @returns Object containing collection address and metadata
 */
export async function deploy_collection(
  agent: SolanaAgentKit,
  options: CollectionOptions,
): Promise<DeployCollectionResponse> {
  try {
    // Initialize Umi
    const umi = initUmi(agent);

    // Generate collection signer
    const collectionSigner = generateSigner(umi);

    // Format creators if provided
    const formattedCreators = options.creators?.map((creator) => ({
      address: publicKey(creator.address),
      percentage: creator.percentage,
    })) || [
      {
        address: publicKey(agent.wallet.publicKey.toString()),
        percentage: 100,
      },
    ];

    // Create collection
    const ixs = createCollection(umi, {
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
    })
      .getInstructions()
      .map((i) => toWeb3JsInstruction(i));
    const tx = new Transaction().add(...ixs);

    const { blockhash } = await agent.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = agent.wallet.publicKey;
    tx.partialSign(toWeb3JsKeypair(collectionSigner));

    const sigOrTx = await signOrSendTX(agent, tx);

    if (typeof sigOrTx !== "string") {
      return {
        collectionAddress: toWeb3JsPublicKey(collectionSigner.publicKey),
        signedTransaction: sigOrTx,
      };
    }

    return {
      collectionAddress: toWeb3JsPublicKey(collectionSigner.publicKey),
      signature: sigOrTx,
    };
  } catch (error: any) {
    throw new Error(`Collection deployment failed: ${error.message}`);
  }
}
