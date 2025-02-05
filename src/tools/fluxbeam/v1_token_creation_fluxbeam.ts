import {
  createFungible,
  mintV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { SolanaAgentKit } from "../../agent";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import * as bs58 from "bs58";
import path from "path";
import fs from "fs/promises";
/**
 * Create a new SPL V1 token
 * @param agent SolanaAgentKit instance
 * @param name Name of the token
 * @param symbol Symbol of the token
 * @param decimals Number of decimals for the token (default: 9)
 * @param initialSupply Initial supply to mint (optional)
 * @param imagePath path to the image to upload it if not uri is provided (optional)
 * @param uri URI for the image (optional)
 * @returns transaction signature
 */
export async function fluxbeamCreateTokenV1(
  agent: SolanaAgentKit,
  name: string,
  symbol: string,
  decimals: number = 9,
  initialSupply?: number,
  imagePath?: string,
  uri?: string,
) {
  try {
    // Create UMI instance from agent
    const umi = createUmi(agent.connection.rpcEndpoint)
      .use(mplToolbox())
      .use(irysUploader());
    umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    if (!uri) {
      if (!imagePath) {
        throw new Error("Either 'uri' or 'imagePath' must be provided.");
      }
      const absoluteFilePath = path.resolve(process.cwd(), imagePath);
      const buffer = await fs.readFile(absoluteFilePath);
      const file = createGenericFile(buffer, path.basename(absoluteFilePath), {
        contentType: "image/jpeg",
      });
      uri = (await umi.uploader.upload([file]))[0];
    }

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

    const txId = await builder.sendAndConfirm(umi, {
      confirm: { commitment: "finalized" },
    });

    const signature = bs58.default.encode(txId.signature);

    return signature;
  } catch (error: any) {
    throw Error(`failed to create V1 token : ${error}`);
  }
}
