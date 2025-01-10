import { SolanaAgentKit } from "../../index";
import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import {
  createFungible,
  mintV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";

/**
 * Deploy a new SPL token
 * @param agent SolanaAgentKit instance
 * @param name Name of the token
 * @param uri URI for the token metadata
 * @param symbol Symbol of the token
 * @param decimals Number of decimals for the token (default: 9)
 * @param initialSupply Initial supply to mint (optional)
 * @returns Object containing token mint address and initial account (if supply was minted)
 */
export async function deploy_token(
  agent: SolanaAgentKit,
  name: string,
  uri: string,
  symbol: string,
  decimals: number = 9,
  initialSupply?: number,
): Promise<{ mint: PublicKey }> {
  try {
    // Create UMI instance from agent
    const umi = createUmi(agent.connection.rpcEndpoint).use(mplToolbox());
    umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    // Create new token mint
    const mint = generateSigner(umi);

    let builder = createFungible(umi, {
      name,
      uri,
      symbol,
      sellerFeeBasisPoints: {
        basisPoints: 0n,
        identifier: "%",
        decimals: 2,
      },
      decimals,
      mint,
    });

    if (initialSupply) {
      builder = builder.add(
        mintV1(umi, {
          mint: mint.publicKey,
          tokenStandard: TokenStandard.Fungible,
          tokenOwner: fromWeb3JsPublicKey(agent.wallet_address),
          amount: initialSupply * Math.pow(10, decimals),
        }),
      );
    }

    builder.sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

    return {
      mint: toWeb3JsPublicKey(mint.publicKey),
    };
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
