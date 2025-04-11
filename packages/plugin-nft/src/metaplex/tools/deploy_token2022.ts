import {
  TokenStandard,
  createFungible,
  mintV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import type { PublicKey } from "@metaplex-foundation/umi";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import type { PublicKey as LegacyPublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";
import { initUmi } from "../../utils";

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

export async function deploy_token2022(
  agent: SolanaAgentKit,
  name: string,
  uri: string,
  symbol: string,
  decimals = 9,
  initialSupply?: number,
): Promise<{ mint: LegacyPublicKey }> {
  try {
    // Create UMI instance from agent
    const umi = initUmi(agent);

    const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
      TOKEN_2022_PROGRAM_ID.toBase58(),
    );
    // Create new token2022 mint
    const mint = generateSigner(umi);

    let builder = createFungible(umi, {
      name,
      uri,
      symbol,
      splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
      sellerFeeBasisPoints: {
        basisPoints: 0n,
        identifier: "%",
        decimals: 2,
      },
      decimals,
      mint,
    });

    if (initialSupply) {
      const token = findAssociatedTokenPda(umi, {
        mint: mint.publicKey,
        owner: fromWeb3JsPublicKey(agent.wallet.publicKey),
        tokenProgramId: SPL_TOKEN_2022_PROGRAM_ID,
      });

      builder = builder.add(
        mintV1(umi, {
          mint: mint.publicKey,
          token,
          splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
          tokenStandard: TokenStandard.Fungible,
          tokenOwner: fromWeb3JsPublicKey(agent.wallet.publicKey),
          amount: initialSupply * Math.pow(10, decimals),
        }),
      );
    }

    await builder.sendAndConfirm(umi, {
      confirm: { commitment: "processed" },
    });

    return {
      mint: toWeb3JsPublicKey(mint.publicKey),
    };
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
