import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { AnchorProvider, IdlAccounts, Program } from "@coral-xyz/anchor";
import { Adrena, IDL as ADRENA_IDL } from "../idls/adrena";

import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TOKENS } from "../constants";

export type AdrenaProgram = Program<Adrena>;

type Accounts = IdlAccounts<Adrena>;

export type Cortex = Accounts["cortex"];
export type Custody = Accounts["custody"] & { pubkey: PublicKey };
export type Pool = Accounts["pool"];

export default class AdrenaClient {
  public static programId = new PublicKey(
    "13gDzEXCdocbj8iAiqrScGo47NiSuYENGsRqi3SEAwet",
  );

  constructor(
    public program: AdrenaProgram,
    public mainPool: Pool,
    public cortex: Cortex,
    public custodies: Custody[],
  ) {}

  public static mainPool = new PublicKey(
    "4bQRutgDJs6vuh6ZcWaPVXiQaBzbHketjbCDjL4oRN34",
  );

  public static async load(agent: SolanaAgentKit): Promise<AdrenaClient> {
    const program = new Program<Adrena>(
      ADRENA_IDL,
      AdrenaClient.programId,
      new AnchorProvider(agent.connection, new NodeWallet(agent.wallet), {
        commitment: "processed",
        skipPreflight: true,
      }),
    );

    const [cortex, mainPool] = await Promise.all([
      program.account.cortex.fetch(AdrenaClient.cortex),
      program.account.pool.fetch(AdrenaClient.mainPool),
    ]);

    const custodiesAddresses = mainPool.custodies.filter(
      (custody) => !custody.equals(PublicKey.default),
    );

    const custodies =
      await program.account.custody.fetchMultiple(custodiesAddresses);

    if (!custodies.length || custodies.some((c) => c === null)) {
      throw new Error("Custodies not found");
    }

    return new AdrenaClient(
      program,
      mainPool,
      cortex,
      (custodies as Custody[]).map((c, i) => ({
        ...c,
        pubkey: custodiesAddresses[i],
      })),
    );
  }

  public static findCustodyAddress(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("custody"),
        AdrenaClient.mainPool.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public static findCustodyTokenAccountAddress(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("custody_token_account"),
        AdrenaClient.mainPool.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public static findPositionAddress(
    owner: PublicKey,
    custody: PublicKey,
    side: "long" | "short",
  ) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        owner.toBuffer(),
        AdrenaClient.mainPool.toBuffer(),
        custody.toBuffer(),
        Buffer.from([
          {
            long: 1,
            short: 2,
          }[side],
        ]),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public static cortex = PublicKey.findProgramAddressSync(
    [Buffer.from("cortex")],
    AdrenaClient.programId,
  )[0];

  public static lpTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("lp_token_mint"), AdrenaClient.mainPool.toBuffer()],
    AdrenaClient.programId,
  )[0];

  public static lmTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("lm_token_mint")],
    AdrenaClient.programId,
  )[0];

  public static getStakingPda(stakedTokenMint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking"), stakedTokenMint.toBuffer()],
      AdrenaClient.programId,
    )[0];
  }

  public static lmStaking = AdrenaClient.getStakingPda(
    AdrenaClient.lmTokenMint,
  );

  public static lpStaking = AdrenaClient.getStakingPda(
    AdrenaClient.lpTokenMint,
  );

  public static transferAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from("transfer_authority")],
    AdrenaClient.programId,
  )[0];

  public static findATAAddressSync(
    wallet: PublicKey,
    mint: PublicKey,
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )[0];
  }

  public getCustodyByMint(mint: PublicKey): Custody {
    const custody = this.custodies.find((custody) => custody.mint.equals(mint));

    if (!custody) {
      throw new Error(`Cannot find custody for mint ${mint.toBase58()}`);
    }

    return custody;
  }

  public static getUserProfilePda(wallet: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), wallet.toBuffer()],
      AdrenaClient.programId,
    )[0];
  }

  public static stakingRewardTokenMint = TOKENS.USDC;

  public static getStakingRewardTokenVaultPda(stakingPda: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking_reward_token_vault"), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  }

  public static lmStakingRewardTokenVault =
    AdrenaClient.getStakingRewardTokenVaultPda(AdrenaClient.lmStaking);
  public static lpStakingRewardTokenVault =
    AdrenaClient.getStakingRewardTokenVaultPda(AdrenaClient.lpStaking);

  public static async isAccountInitialized(
    connection: Connection,
    address: PublicKey,
  ): Promise<boolean> {
    return !!(await connection.getAccountInfo(address));
  }

  public static createATAInstruction({
    ataAddress,
    mint,
    owner,
    payer = owner,
  }: {
    ataAddress: PublicKey;
    mint: PublicKey;
    owner: PublicKey;
    payer?: PublicKey;
  }) {
    return createAssociatedTokenAccountInstruction(
      payer,
      ataAddress,
      owner,
      mint,
    );
  }
}
