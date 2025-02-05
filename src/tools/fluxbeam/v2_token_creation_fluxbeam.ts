import {
  AccountState,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createEnableRequiredMemoTransfersInstruction,
  createInitializeDefaultAccountStateInstruction,
  createInitializeImmutableOwnerInstruction,
  createInitializeInstruction,
  createInitializeInterestBearingMintInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeTransferFeeConfigInstruction,
  createMintToInstruction,
  createThawAccountInstruction,
  getAssociatedTokenAddressSync,
  getMintLen,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import { pack } from "@solana/spl-token-metadata";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { none } from "@metaplex-foundation/umi-options";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createGenericFile, keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import path from "path";
import fs from "fs/promises";
import { FEE_ACCOUNT } from "../../constants";

export interface ExtensionConfig {
  type: ExtensionType;
  cfg: Record<string, any>; // Dynamic structure for each extension's config
}

export class CreateMintV1 {
  name: string;
  symbol: string;
  metadataUri: string;
  decimals: number;
  totalSupply: bigint;

  mintAuthority: PublicKey;
  freezeAuthority: PublicKey | null;

  sellerFeeBasisPoints: number = 0;

  //Do we mint the total supply to the user
  mintTotalSupply: boolean;

  creators: [] | null = null;

  constructor(
    name: string,
    symbol: string,
    metadataUri: string,
    totalSupply: bigint,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals = 6,
    mintTotalSupply = true,
  ) {
    this.name = name;
    this.symbol = symbol;
    this.metadataUri = metadataUri;
    this.totalSupply = totalSupply;
    this.decimals = decimals;
    this.mintTotalSupply = mintTotalSupply;
    this.mintAuthority = mintAuthority;
    this.freezeAuthority = freezeAuthority;
  }

  setSellerFeeBasisPoints(bp: number) {
    this.sellerFeeBasisPoints = bp;
  }

  setCreators(creators: []) {
    this.creators = creators;
  }
}

export class CreateMintV2 extends CreateMintV1 {
  extensions: ExtensionType[] = [];
  extensionConfig: object = {};

  metadata: any;

  setMetadata(meta: any) {
    this.metadata = meta;
  }

  metadataLength(): number {
    if (!this.metadata) {
      return 0;
    }
    return (
      pack({
        additionalMetadata: this.metadata?.additionalMetadata || [], //[string, string]
        mint: this.metadata.mint, // Default/Placeholder PublicKey,
        symbol: this.metadata.symbol,
        name: this.metadata.name,
        uri: this.metadata.uri,
      }).length + 4
    );
  }

  addExtension(ext: ExtensionType, config: object = {}) {
    this.extensions.push(ext);
    // @ts-expect-error: TypeScript doesn't recognize 'ExtensionType' as a valid index for 'extensionConfig'
    this.extensionConfig[ext] = config;
  }
}

async function getCreateToken2022MintTransaction(
  agent: SolanaAgentKit,
  owner: PublicKey,
  tokenMint: PublicKey,
  config: CreateMintV2,
  priorityFee: number,
) {
  const mintLen = getMintLen(config.extensions);
  // console.log(`this is the mintLen ${mintLen}`);
  // console.log(`this is the metadataLength ${config.metadataLength()}`);
  const mintLamports = await agent.connection.getMinimumBalanceForRentExemption(
    mintLen + config.metadataLength(),
  );
  const ata = getAssociatedTokenAddressSync(
    tokenMint,
    owner,
    true,
    TOKEN_2022_PROGRAM_ID,
  );
  const ON_CHAIN_METADATA = {
    name: config.name,
    symbol: config.symbol,
    uri: config.metadataUri,
    sellerFeeBasisPoints: 0,
    uses: none(),
    creators: none(),
    collection: none(),
  } as DataV2;
  const unitLimit = 120_000;
  const unitPrice = Math.floor(priorityFee / unitLimit);
  const transaction = new Transaction();
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: unitLimit }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: unitPrice }),
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: tokenMint,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: FEE_ACCOUNT,
      lamports: 200000,
    }),
    new TransactionInstruction({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(config.name),
    }),
  );
  let isDefaultFrozen = false;
  config.extensions.forEach((ext: string | number) => {
    // @ts-expect-error: TypeScript doesn't recognize 'ExtensionType' as a valid index for 'extensionConfig'
    const cfg = config.extensionConfig[ext];
    // eslint-disable-next-line no-console
    // console.log(`${ext}`, cfg);

    switch (ext) {
      case ExtensionType.TransferFeeConfig:
        ON_CHAIN_METADATA.sellerFeeBasisPoints = cfg.feeBasisPoints; //Update so it reflects same as royalties
        transaction.add(
          createInitializeTransferFeeConfigInstruction(
            tokenMint,
            cfg.transfer_fee_config_authority
              ? cfg.transfer_fee_config_authority
              : config.mintAuthority, //Config Auth
            cfg.withdraw_withheld_authority
              ? cfg.withdraw_withheld_authority
              : config.mintAuthority, //Withdraw Auth
            cfg.feeBasisPoints,
            cfg.maxFee,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.InterestBearingConfig:
        transaction.add(
          createInitializeInterestBearingMintInstruction(
            tokenMint,
            owner, //Rate Auth
            cfg.rate * 100,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.PermanentDelegate:
        transaction.add(
          createInitializePermanentDelegateInstruction(
            tokenMint,
            new PublicKey(cfg.address),
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.NonTransferable:
        transaction.add(
          createInitializeNonTransferableMintInstruction(
            tokenMint,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.ImmutableOwner:
        transaction.add(
          createInitializeImmutableOwnerInstruction(
            tokenMint,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.MemoTransfer:
        transaction.add(
          createEnableRequiredMemoTransfersInstruction(
            tokenMint,
            owner,
            [],
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        if (config.mintTotalSupply) {
          transaction.add(
            new TransactionInstruction({
              keys: [{ pubkey: owner, isSigner: true, isWritable: true }],
              data: Buffer.from("Mint To Memo", "utf-8"),
              programId: new PublicKey(
                "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
              ),
            }),
          );
        }
        break;
      case ExtensionType.DefaultAccountState:
        isDefaultFrozen = cfg.state === AccountState.Frozen;
        transaction.add(
          createInitializeDefaultAccountStateInstruction(
            tokenMint,
            cfg.state,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.MintCloseAuthority:
        transaction.add(
          createInitializeMintCloseAuthorityInstruction(
            tokenMint,
            config.mintAuthority,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      case ExtensionType.MetadataPointer:
        transaction.add(
          createInitializeMetadataPointerInstruction(
            tokenMint,
            config.mintAuthority,
            tokenMint,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        break;
      default:
        console.error("Unsupported extension", ext);
        break;
    }
  });

  //Init the mint
  transaction.add(
    createInitializeMintInstruction(
      tokenMint,
      config.decimals,
      config.mintAuthority,
      config.freezeAuthority,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  if (config.metadata) {
    transaction.add(
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: tokenMint,
        updateAuthority: config.mintAuthority,
        mint: tokenMint,
        mintAuthority: config.mintAuthority,
        name: config.metadata.name,
        symbol: config.metadata.symbol,
        uri: config.metadata.uri,
      }),
    );
  }

  if (config.mintTotalSupply) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        owner,
        ata,
        owner,
        tokenMint,
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    if (isDefaultFrozen) {
      transaction.add(
        createThawAccountInstruction(
          ata,
          tokenMint,
          owner,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );
    }

    transaction.add(
      createMintToInstruction(
        tokenMint,
        ata,
        owner,
        config.totalSupply,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );
  }

  return transaction;
}

export async function fluxbeamCreateTokenV2(
  agent: SolanaAgentKit,
  owner: PublicKey,
  tokenMint: Keypair,
  name: string,
  symbol: string,
  totalSupply: bigint,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals = 6,
  mintTotalSupply = true,
  priorityFee: number,
  extensions: ExtensionConfig[],
  description?: string,
  metadataUri?: string,
  imagePath?: string,
  imageUri?: string,
) {
  try {
    const umi = createUmi(agent.connection.rpcEndpoint)
      .use(mplToolbox())
      .use(irysUploader());
    umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

    // Ensure either metadataUri, imageUri, or imagePath is provided
    if (!metadataUri && !imageUri && !imagePath) {
      throw new Error(
        "At least one of 'metadataUri', 'imageUri', or 'imagePath' must be provided to create token metadata.",
      );
    }

    // If metadataUri is not provided, process imageUri or imagePath to generate it
    if (!metadataUri) {
      // If imageUri is provided, use it to create the metadata
      if (imageUri) {
        metadataUri = await umi.uploader.uploadJson({
          name,
          description: description || "No description provided",
          image: imageUri,
        });

        if (!metadataUri) {
          throw new Error(
            "Failed to upload metadata JSON using the provided image URI.",
          );
        }
      }
      // If imageUri is not provided but imagePath is, upload the image and use the resulting URI
      else if (imagePath) {
        const absoluteFilePath = path.resolve(process.cwd(), imagePath);
        const buffer = await fs.readFile(absoluteFilePath);
        const file = createGenericFile(
          buffer,
          path.basename(absoluteFilePath),
          {
            contentType: "image/jpeg",
          },
        );
        const uploadedImageUri = (await umi.uploader.upload([file]))[0];

        if (!uploadedImageUri) {
          throw new Error(
            "Failed to upload the image and generate its URI from imagePath.",
          );
        }

        metadataUri = await umi.uploader.uploadJson({
          name,
          description: description || "No description provided",
          image: uploadedImageUri,
        });

        if (!metadataUri) {
          throw new Error(
            "Failed to upload metadata JSON using the uploaded image URI.",
          );
        }
      }
    }
    // Ensure metadataUri is a valid string before proceeding
    if (!metadataUri) {
      throw new Error(
        "Failed to resolve metadataUri. It must be a valid string.",
      );
    }

    const config = new CreateMintV2(
      name,
      symbol,
      metadataUri,
      totalSupply,
      mintAuthority,
      freezeAuthority,
      decimals,
      mintTotalSupply,
    );
    config.setSellerFeeBasisPoints(0.5);
    config.setCreators([]);

    extensions.forEach(({ type, cfg }) => {
      config.addExtension(type, cfg);
    });
    if (description || metadataUri) {
      config.setMetadata({
        name,
        mint: new PublicKey("11111111111111111111111111111111"), //default public key
        symbol,
        uri: metadataUri,
        additionalMetadata: description ? [] : [], // { key: "description", value: description } will fix description
      });
    }
    const transaction = await getCreateToken2022MintTransaction(
      agent,
      owner,
      tokenMint.publicKey,
      config,
      priorityFee,
    );
    const blockhash = await agent.connection.getLatestBlockhash();
    transaction.feePayer = agent.wallet_address;
    transaction.recentBlockhash = blockhash.blockhash;

    const signature = agent.connection.sendTransaction(transaction, [
      tokenMint,
    ]);
    return signature;
  } catch (error: any) {
    throw Error(`failed to create V2 token : ${error}`);
  }
}
