import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  getGroupMemberPointerState,
  getGroupPointerState,
  getInterestBearingMintConfigState,
  getMetadataPointerState,
  getMint,
  getMintCloseAuthority,
  getPermanentDelegate,
  getTransferFeeConfig,
  getTransferHook,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair, TransactionInstruction } from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import * as bs58 from "bs58";
import { sendTx } from "../../utils/send_tx";
/**
 * Mints tokens to the associated token account of a given owner.
 * If the associated token account does not exist, it is created.
 * it can be used to used more tokens for an existing mint
 *
 * @param {SolanaAgentKit} agent - SolanaAgentKit instance
 * @param {PublicKey} tokenMint - The public key of the token mint account.
 * @param {number} amount - The amount of tokens to mint.
 * @param {PublicKey} owner - The public key of the token account owner.
 * @param {boolean} [v2=true] - Whether to use the Token 2022 program.
 * @returns {Promise<string>} - The transaction signature.
 */
export async function mintToAccount(
  agent: SolanaAgentKit,
  tokenMint: PublicKey,
  amount: number,
  owner?: PublicKey,
  v2: boolean = true,
) {
  const program = v2 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
  const decimals = (
    await getMint(agent.connection, tokenMint, "finalized", program)
  ).decimals;

  const instructions: TransactionInstruction[] = [];

  const ata = getAssociatedTokenAddressSync(
    tokenMint,
    owner ?? agent.wallet_address,
    true,
    program,
  );

  const dstIfo = await agent.connection.getAccountInfo(ata, "confirmed");
  if (!dstIfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        owner ?? agent.wallet_address,
        ata,
        owner ?? agent.wallet_address,
        tokenMint,
        program,
      ),
    );
  }

  instructions.push(
    createMintToInstruction(
      tokenMint,
      ata,
      owner ?? agent.wallet_address,
      amount * Math.pow(10, decimals),
      [],
      program,
    ),
  );

  const signature = sendTx(agent, instructions);

  return signature;
}

/**
 * Sets a new authority for a given mint account.
 *
 * @param {SolanaAgentKit} agent -SolanaAgentKit instance
 * @param {PublicKey} mint - The public key of the mint account.
 * @param {AuthorityType} authorityType - The type of authority to set (e.g., Mint, Freeze, Close).
 * @param {PublicKey|null} newAuthority - The public key of the new authority, or null to revoke.
 * @returns {Promise<string>} - The transaction signature.
 */
export async function setAuthority(
  agent: SolanaAgentKit,
  mint: PublicKey,
  authorityType: AuthorityType,
  newAuthority: PublicKey | null,
) {
  // Get the mint account info
  const mintInfo = await getMint(
    agent.connection,
    mint,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  const mintAccount = await agent.connection.getAccountInfo(mint);
  const programID = mintAccount?.owner;

  let currentAuthority: PublicKey | null | undefined;

  // Fetch current authority based on authorityType
  switch (authorityType) {
    case AuthorityType.MintTokens:
      currentAuthority = mintInfo.mintAuthority;
      break;
    case AuthorityType.FreezeAccount:
      currentAuthority = mintInfo.freezeAuthority;
      break;
    case AuthorityType.TransferFeeConfig:
      currentAuthority =
        getTransferFeeConfig(mintInfo)?.transferFeeConfigAuthority;
      break;
    case AuthorityType.WithheldWithdraw:
      currentAuthority =
        getTransferFeeConfig(mintInfo)?.withdrawWithheldAuthority;
      break;
    case AuthorityType.CloseMint:
      currentAuthority = getMintCloseAuthority(mintInfo)?.closeAuthority;
      break;
    case AuthorityType.InterestRate:
      currentAuthority =
        getInterestBearingMintConfigState(mintInfo)?.rateAuthority;
      break;
    case AuthorityType.PermanentDelegate:
      currentAuthority = getPermanentDelegate(mintInfo)?.delegate; // not sure
      break;
    case AuthorityType.TransferHookProgramId:
      currentAuthority = getTransferHook(mintInfo)?.authority;
      break;
    case AuthorityType.MetadataPointer:
      currentAuthority = getMetadataPointerState(mintInfo)?.authority;
      break;
    case AuthorityType.GroupPointer:
      currentAuthority = getGroupPointerState(mintInfo)?.authority;
      break;
    case AuthorityType.GroupMemberPointer:
      currentAuthority = getGroupMemberPointerState(mintInfo)?.authority;
      break;
    default:
      currentAuthority = agent.wallet_address;
  }

  if (!currentAuthority) {
    throw new Error(
      `No authority of type ${authorityType} found for mint ${mint.toBase58()}`,
    );
  }

  // Check if we're the current authority
  const isWalletCurrentAuthority = currentAuthority.equals(
    agent.wallet_address,
  );

  // If we're not the current authority, we need the current authority's keypair
  let currentAuthorityKeypair: Keypair | undefined;

  if (!isWalletCurrentAuthority) {
    // Get the new update authority from environment variable, we do this because we have to sign the transaction with the new authority that is being updated.
    const currentAuthoritySecret =
      process.env.CURRENT_UPDATE_AUTHORITY_PRIVATE_KEY;
    if (!currentAuthoritySecret) {
      throw new Error(
        "NEW_UPDATE_AUTHORITY_PRIVATE_KEY is not set in environment variables",
      );
    }

    try {
      currentAuthorityKeypair = Keypair.fromSecretKey(
        bs58.default.decode(currentAuthoritySecret),
      );
    } catch (error: any) {
      throw new Error(
        `Invalid new update authority private key: ${error.message}`,
      );
    }
  }
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createSetAuthorityInstruction(
      mint,
      currentAuthority,
      authorityType,
      newAuthority,
      [],
      programID,
    ),
  );
  // Sign and send transaction with the appropriate keypair(s)
  let signature: string;
  if (currentAuthorityKeypair) {
    // If we're not the current authority, we need both signatures
    signature = await sendTx(agent, instructions, [currentAuthorityKeypair]);
  } else {
    // If we are the current authority, we only need the wallet signature
    signature = await sendTx(agent, instructions);
  }

  return signature;
}

/**
 * Revokes an authority from a given mint account by setting it to null.
 *
 * @param {SolanaAgentKit} agent - SolanaAgentKit instance
 * @param {PublicKey} mint - The public key of the mint account.
 * @param {AuthorityType} authorityType - The type of authority to revoke (e.g., Mint, Freeze, Close).
 * @returns {Promise<string>} - The transaction signature.
 */
export function revokeAuthority(
  agent: SolanaAgentKit,
  mint: PublicKey,
  authorityType: AuthorityType,
): Promise<string> {
  return setAuthority(agent, mint, authorityType, null);
}
