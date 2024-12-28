import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import Decimal from "decimal.js";
import { DEFAULT_OPTIONS } from "../constants";
import {
  deploy_collection,
  deploy_token,
  get_balance,
  getTPS,
  resolveSolDomain,
  getPrimaryDomain,
  launchPumpFunToken,
  lendAsset,
  mintCollectionNFT,
  openbookCreateMarket,
  raydiumCreateAmmV4,
  raydiumCreateClmm,
  raydiumCreateCpmm,
  registerDomain,
  request_faucet_funds,
  trade,
  transfer,
  getTokenDataByAddress,
  getTokenDataByTicker,
  stakeWithJup,
  sendCompressedAirdrop,
  createOrcaSingleSidedWhirlpool,
  fetchPrice,
  pythFetchPrice,
  FEE_TIERS,
  getAllDomainsTLDs,
  getAllRegisteredAllDomains,
  getOwnedDomainsForTLD,
  getMainAllDomainsDomain,
  getOwnedAllDomains,
  resolveAllDomains,
  create_gibwork_task,
  rock_paper_scissor,
  create_TipLink,
} from "../tools";
import {
  CollectionDeployment,
  CollectionOptions,
  GibworkCreateTaskReponse,
  JupiterTokenData,
  MintCollectionNFTResponse,
  PumpfunLaunchResponse,
  PumpFunTokenOptions,
} from "../types";
import { BN } from "@coral-xyz/anchor";

/**
 * Main class for interacting with Solana blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SolanaAgentKit
 * @property {Connection} connection - Solana RPC connection
 * @property {Keypair} wallet - Wallet keypair for signing transactions
 * @property {PublicKey} wallet_address - Public key of the wallet
 */
export class SolanaAgentKit {
  public connection: Connection;
  public wallet: Keypair;
  public wallet_address: PublicKey;
  public openai_api_key: string;

  constructor(
    private_key: string,
    rpc_url = "https://api.mainnet-beta.solana.com",
    openai_api_key: string,
  ) {
    this.connection = new Connection(rpc_url);
    this.wallet = Keypair.fromSecretKey(bs58.decode(private_key));
    this.wallet_address = this.wallet.publicKey;
    this.openai_api_key = openai_api_key;
  }

  // Tool methods
  async requestFaucetFunds() {
    return request_faucet_funds(this);
  }

  async deployToken(
    name: string,
    uri: string,
    symbol: string,
    decimals: number = DEFAULT_OPTIONS.TOKEN_DECIMALS,
    initialSupply?: number,
  ): Promise<{ mint: PublicKey }> {
    return deploy_token(this, name, uri, symbol, decimals, initialSupply);
  }

  async deployCollection(
    options: CollectionOptions,
  ): Promise<CollectionDeployment> {
    return deploy_collection(this, options);
  }

  async getBalance(token_address?: PublicKey): Promise<number> {
    return get_balance(this, token_address);
  }

  async mintNFT(
    collectionMint: PublicKey,
    metadata: Parameters<typeof mintCollectionNFT>[2],
    recipient?: PublicKey,
  ): Promise<MintCollectionNFTResponse> {
    return mintCollectionNFT(this, collectionMint, metadata, recipient);
  }

  async transfer(
    to: PublicKey,
    amount: number,
    mint?: PublicKey,
  ): Promise<string> {
    return transfer(this, to, amount, mint);
  }

  async registerDomain(name: string, spaceKB?: number): Promise<string> {
    return registerDomain(this, name, spaceKB);
  }

  async resolveSolDomain(domain: string): Promise<PublicKey> {
    return resolveSolDomain(this, domain);
  }

  async getPrimaryDomain(account: PublicKey): Promise<string> {
    return getPrimaryDomain(this, account);
  }

  async trade(
    outputMint: PublicKey,
    inputAmount: number,
    inputMint?: PublicKey,
    slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
  ): Promise<string> {
    return trade(this, outputMint, inputAmount, inputMint, slippageBps);
  }

  async lendAssets(amount: number): Promise<string> {
    return lendAsset(this, amount);
  }

  async getTPS(): Promise<number> {
    return getTPS(this);
  }

  async getTokenDataByAddress(
    mint: string,
  ): Promise<JupiterTokenData | undefined> {
    return getTokenDataByAddress(new PublicKey(mint));
  }

  async getTokenDataByTicker(
    ticker: string,
  ): Promise<JupiterTokenData | undefined> {
    return getTokenDataByTicker(ticker);
  }

  async fetchTokenPrice(mint: string) {
    return fetchPrice(new PublicKey(mint));
  }

  async launchPumpFunToken(
    tokenName: string,
    tokenTicker: string,
    description: string,
    imageUrl: string,
    options?: PumpFunTokenOptions,
  ): Promise<PumpfunLaunchResponse> {
    return launchPumpFunToken(
      this,
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      options,
    );
  }

  async stake(amount: number): Promise<string> {
    return stakeWithJup(this, amount);
  }

  async sendCompressedAirdrop(
    mintAddress: string,
    amount: number,
    decimals: number,
    recipients: string[],
    priorityFeeInLamports: number,
    shouldLog: boolean,
  ): Promise<string[]> {
    return await sendCompressedAirdrop(
      this,
      new PublicKey(mintAddress),
      amount,
      decimals,
      recipients.map((recipient) => new PublicKey(recipient)),
      priorityFeeInLamports,
      shouldLog,
    );
  }

  async createOrcaSingleSidedWhirlpool(
    depositTokenAmount: BN,
    depositTokenMint: PublicKey,
    otherTokenMint: PublicKey,
    initialPrice: Decimal,
    maxPrice: Decimal,
    feeTier: keyof typeof FEE_TIERS,
  ) {
    return createOrcaSingleSidedWhirlpool(
      this,
      depositTokenAmount,
      depositTokenMint,
      otherTokenMint,
      initialPrice,
      maxPrice,
      feeTier,
    );
  }

  async resolveAllDomains(domain: string): Promise<PublicKey | undefined> {
    return resolveAllDomains(this, domain);
  }

  async getOwnedAllDomains(owner: PublicKey): Promise<string[]> {
    return getOwnedAllDomains(this, owner);
  }

  async getOwnedDomainsForTLD(tld: string): Promise<string[]> {
    return getOwnedDomainsForTLD(this, tld);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async getAllDomainsTLDs(): Promise<String[]> {
    return getAllDomainsTLDs(this);
  }

  async getAllRegisteredAllDomains(): Promise<string[]> {
    return getAllRegisteredAllDomains(this);
  }

  async getMainAllDomainsDomain(owner: PublicKey): Promise<string | null> {
    return getMainAllDomainsDomain(this, owner);
  }

  async raydiumCreateAmmV4(
    marketId: PublicKey,
    baseAmount: BN,
    quoteAmount: BN,
    startTime: BN,
  ): Promise<string> {
    return raydiumCreateAmmV4(
      this,
      marketId,

      baseAmount,
      quoteAmount,

      startTime,
    );
  }

  async raydiumCreateClmm(
    mint1: PublicKey,
    mint2: PublicKey,
    configId: PublicKey,
    initialPrice: Decimal,
    startTime: BN,
  ): Promise<string> {
    return raydiumCreateClmm(
      this,
      mint1,
      mint2,
      configId,
      initialPrice,
      startTime,
    );
  }

  async raydiumCreateCpmm(
    mint1: PublicKey,
    mint2: PublicKey,
    configId: PublicKey,
    mintAAmount: BN,
    mintBAmount: BN,
    startTime: BN,
  ): Promise<string> {
    return raydiumCreateCpmm(
      this,
      mint1,
      mint2,
      configId,
      mintAAmount,
      mintBAmount,

      startTime,
    );
  }

  async openbookCreateMarket(
    baseMint: PublicKey,
    quoteMint: PublicKey,
    lotSize: number = 1,
    tickSize: number = 0.01,
  ): Promise<string[]> {
    return openbookCreateMarket(
      this,
      baseMint,
      quoteMint,

      lotSize,
      tickSize,
    );
  }

  async pythFetchPrice(priceFeedID: string): Promise<string> {
    return pythFetchPrice(priceFeedID);
  }

  async createGibworkTask(
    title: string,
    content: string,
    requirements: string,
    tags: string[],
    tokenMintAddress: string,
    tokenAmount: number,
    payer?: string,
  ): Promise<GibworkCreateTaskReponse> {
    return create_gibwork_task(
      this,
      title,
      content,
      requirements,
      tags,
      new PublicKey(tokenMintAddress),
      tokenAmount,
      payer ? new PublicKey(payer) : undefined,
    );
  }

  async rockPaperScissors(
    amount: number,
    choice: "rock" | "paper" | "scissors",
  ) {
    return rock_paper_scissor(this, amount, choice);
  }
  async createTiplink(amount: number, splmintAddress?: PublicKey) {
    return create_TipLink(this, amount, splmintAddress);
  }
}
