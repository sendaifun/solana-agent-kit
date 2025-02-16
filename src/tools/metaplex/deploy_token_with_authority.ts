import { SolanaAgentKit, SplAuthorityInput } from "../../index";
import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  none,
} from "@metaplex-foundation/umi";
import {
  createFungible,
  mintV1,
  updateV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  AuthorityType,
  mplToolbox,
  setAuthority,
} from "@metaplex-foundation/mpl-toolbox";

/**
 * Deploy a new SPL token
 * @param agent SolanaAgentKit instance
 * @param name Name of the token
 * @param uri URI for the token metadata
 * @param symbol Symbol of the token
 * @param decimals Number of decimals for the token (default: 9)
 * @param initialSupply Initial supply to mint (optional)
 * @param authority Authority for the token, including mint, freeze, and mutability
 * @returns Object containing token mint address and initial account (if supply was minted)
 */

export async function deploy_token_with_authority(
  agent: SolanaAgentKit,
  name: string,
  uri: string,
  symbol: string,
  decimals: number = 9,
  authority: SplAuthorityInput,
  initialSupply?: number,
): Promise<{ mint: PublicKey }> {
  try {
    // Create UMI instance from agent
    const umi = createUmi(agent.connection.rpcEndpoint).use(mplToolbox());
    umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    const mint = generateSigner(umi);

    // Create new token mint
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

    builder = builder.add(
      setAuthority(umi, {
        owned: mint.publicKey,
        owner: fromWeb3JsPublicKey(agent.wallet_address),
        authorityType: AuthorityType.MintTokens,
        newAuthority: authority.mintability
          ? fromWeb3JsPublicKey(authority.mintability)
          : none(),
      }),
    );

    builder = builder.add(
      setAuthority(umi, {
        owned: mint.publicKey,
        owner: fromWeb3JsPublicKey(agent.wallet_address),
        authorityType: AuthorityType.FreezeAccount,
        newAuthority: authority.freezability
          ? fromWeb3JsPublicKey(authority.freezability)
          : none(),
      }),
    );

    builder = builder.add(
      updateV1(umi, {
        isMutable: authority.isMutable ? true : false,
        mint: mint.publicKey,
        authority: createSignerFromKeypair(
          umi,
          fromWeb3JsKeypair(agent.wallet),
        ),
        newUpdateAuthority: authority.updateAuthority
          ? fromWeb3JsPublicKey(authority.updateAuthority)
          : fromWeb3JsPublicKey(agent.wallet_address),
      }),
    );

    await builder.sendAndConfirm(umi, { confirm: { commitment: "processed" } });

    return {
      mint: toWeb3JsPublicKey(mint.publicKey),
    };
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
