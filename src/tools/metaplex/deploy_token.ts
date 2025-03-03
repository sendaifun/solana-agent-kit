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
  TokenStandard,
  updateV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  mplToolbox,
  setAuthority,
  AuthorityType,
} from "@metaplex-foundation/mpl-toolbox";

/**
 * Deploy a new SPL token
 * @param agent SolanaAgentKit instance
 * @param name Name of the token
 * @param uri URI for the token metadata
 * @param symbol Symbol of the token
 * @param decimals Number of decimals for the token (default: 9)
 * @param authority Authority for the token mint (optional). It contains mintAuthority, freezeAuthority, updateAuthority and isMutale. Default is the agent wallet address for every authority and true for isMutable.
 * @param initialSupply Initial supply to mint (optional)
 * @returns Object containing token mint address and initial account (if supply was minted)
 */
export async function deploy_token(
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

    // Set default token authority
    const defaultAuthority: SplAuthorityInput = {
      mintAuthority: agent.wallet_address,
      freezeAuthority: agent.wallet_address,
      updateAuthority: agent.wallet_address,
      isMutable: true,
    };

    if (authority.mintAuthority === null) {
      defaultAuthority.mintAuthority = null;
    } else if (authority.mintAuthority !== undefined) {
      defaultAuthority.mintAuthority = new PublicKey(authority.mintAuthority);
    }

    if (authority.freezeAuthority === null) {
      defaultAuthority.freezeAuthority = null;
    } else if (authority.freezeAuthority !== undefined) {
      defaultAuthority.freezeAuthority = new PublicKey(
        authority.freezeAuthority,
      );
    }

    if (authority.updateAuthority !== undefined) {
      defaultAuthority.updateAuthority = new PublicKey(
        authority.updateAuthority,
      );
    }

    if (authority.isMutable !== undefined) {
      defaultAuthority.isMutable = authority.isMutable;
    }

    if (defaultAuthority.mintAuthority !== agent.wallet_address) {
      builder = builder.add(
        setAuthority(umi, {
          owned: mint.publicKey,
          owner: fromWeb3JsPublicKey(agent.wallet_address),
          authorityType: AuthorityType.MintTokens,
          newAuthority: defaultAuthority.mintAuthority
            ? fromWeb3JsPublicKey(defaultAuthority.mintAuthority)
            : none(),
        }),
      );
    }

    if (defaultAuthority.freezeAuthority !== agent.wallet.publicKey) {
      builder = builder.add(
        setAuthority(umi, {
          owned: mint.publicKey,
          owner: fromWeb3JsPublicKey(agent.wallet_address),
          authorityType: AuthorityType.FreezeAccount,
          newAuthority: defaultAuthority.freezeAuthority
            ? fromWeb3JsPublicKey(defaultAuthority.freezeAuthority)
            : none(),
        }),
      );
    }

    if (defaultAuthority.updateAuthority !== agent.wallet.publicKey) {
      builder = builder.add(
        updateV1(umi, {
          isMutable: authority.isMutable === false ? false : true,
          mint: mint.publicKey,
          authority: createSignerFromKeypair(
            umi,
            fromWeb3JsKeypair(agent.wallet),
          ),
          newUpdateAuthority: defaultAuthority.updateAuthority
            ? fromWeb3JsPublicKey(defaultAuthority.updateAuthority)
            : fromWeb3JsPublicKey(agent.wallet_address),
        }),
      );
    } else {
      builder = builder.add(
        updateV1(umi, {
          isMutable: authority.isMutable === false ? false : true,
          mint: mint.publicKey,
          authority: createSignerFromKeypair(
            umi,
            fromWeb3JsKeypair(agent.wallet),
          ),
        }),
      );
    }

    await builder.sendAndConfirm(umi, { confirm: { commitment: "processed" } });

    return {
      mint: toWeb3JsPublicKey(mint.publicKey),
    };
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
