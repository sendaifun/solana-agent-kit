import {
  TokenStandard,
  createFungible,
  mintV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { AuthorityType, setAuthority } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, none } from "@metaplex-foundation/umi";
import {
  fromWeb3JsPublicKey,
  toWeb3JsInstruction,
  toWeb3JsKeypair,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { initUmi } from "../../utils";
import { SPLAuthorityInput } from "../types";

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
  authority?: SPLAuthorityInput,
  decimals: number = 9,
  initialSupply?: number,
) {
  try {
    // Create UMI instance from agent
    const umi = initUmi(agent);

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
          tokenOwner: fromWeb3JsPublicKey(agent.wallet.publicKey),
          amount: initialSupply * Math.pow(10, decimals),
        }),
      );
    }

    // Set default token authority
    const defaultAuthority: SPLAuthorityInput = {
      mintAuthority: agent.wallet.publicKey,
      freezeAuthority: agent.wallet.publicKey,
      updateAuthority: agent.wallet.publicKey,
      isMutable: true,
    };

    if (authority?.mintAuthority === null) {
      defaultAuthority.mintAuthority = null;
    } else if (authority?.mintAuthority !== undefined) {
      defaultAuthority.mintAuthority = new PublicKey(authority?.mintAuthority);
    }

    if (authority?.freezeAuthority === null) {
      defaultAuthority.freezeAuthority = null;
    } else if (authority?.freezeAuthority !== undefined) {
      defaultAuthority.freezeAuthority = new PublicKey(
        authority?.freezeAuthority,
      );
    }

    if (
      authority?.updateAuthority !== undefined &&
      authority?.updateAuthority !== null
    ) {
      defaultAuthority.updateAuthority = new PublicKey(
        authority?.updateAuthority,
      );
    }

    if (authority?.isMutable !== undefined) {
      defaultAuthority.isMutable = authority?.isMutable;
    }

    if (defaultAuthority.mintAuthority !== agent.wallet.publicKey) {
      builder = builder.add(
        setAuthority(umi, {
          owned: mint.publicKey,
          owner: fromWeb3JsPublicKey(agent.wallet.publicKey),
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
          owner: fromWeb3JsPublicKey(agent.wallet.publicKey),
          authorityType: AuthorityType.FreezeAccount,
          newAuthority: defaultAuthority.freezeAuthority
            ? fromWeb3JsPublicKey(defaultAuthority.freezeAuthority)
            : none(),
        }),
      );
    }

    const ixs = builder.getInstructions().map((ix) => toWeb3JsInstruction(ix));
    const tx = new Transaction().add(...ixs);

    const { blockhash } = await agent.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = agent.wallet.publicKey;
    tx.partialSign(toWeb3JsKeypair(mint));

    if (agent.config.signOnly) {
      return await agent.wallet.signTransaction(tx);
    }

    await signOrSendTX(agent, tx);
    return {
      mint: toWeb3JsPublicKey(mint.publicKey),
    };
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
