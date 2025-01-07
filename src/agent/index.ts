import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import bs58 from "bs58";
import Decimal from "decimal.js";
import { DEFAULT_OPTIONS } from "../constants";
import { Config, TokenCheck } from "../types";
import {
  deploy_collection,
  deploy_token,
  get_balance,
  get_balance_other,
  getTPS,
  resolveSolDomain,
  getPrimaryDomain,
  launchPumpFunToken,
  lendAsset,
  mintCollectionNFT,
  openbookCreateMarket,
  manifestCreateMarket,
  raydiumCreateAmmV4,
  raydiumCreateClmm,
  raydiumCreateCpmm,
  registerDomain,
  request_faucet_funds,
  trade,
  limitOrder,
  batchOrder,
  cancelAllOrders,
  withdrawAll,
  closePerpTradeShort,
  closePerpTradeLong,
  openPerpTradeShort,
  openPerpTradeLong,
  transfer,
  getTokenDataByAddress,
  getTokenDataByTicker,
  stakeWithJup,
  stakeWithSolayer,
  sendCompressedAirdrop,
  orcaCreateSingleSidedLiquidityPool,
  orcaCreateCLMM,
  orcaOpenCenteredPositionWithLiquidity,
  orcaOpenSingleSidedPosition,
  FEE_TIERS,
  fetchPrice,
  getAllDomainsTLDs,
  getAllRegisteredAllDomains,
  getOwnedDomainsForTLD,
  getMainAllDomainsDomain,
  getOwnedAllDomains,
  resolveAllDomains,
  create_gibwork_task,
  orcaClosePosition,
  orcaFetchPositions,
  rock_paper_scissor,
  create_TipLink,
  listNFTForSale,
  cancelListing,
  fetchTokenReportSummary,
  fetchTokenDetailedReport,
  fetchPythPrice,
  fetchPythPriceFeedID,
  flashOpenTrade,
  flashCloseTrade,
} from "../tools";
import {
  CollectionDeployment,
  CollectionOptions,
  GibworkCreateTaskReponse,
  JupiterTokenData,
  MintCollectionNFTResponse,
  PumpfunLaunchResponse,
  PumpFunTokenOptions,
  OrderParams,
  FlashTradeParams,
  FlashCloseTradeParams,
} from "../types";
import {
  createCollection,
  createSingle,
} from "../tools/create_3land_collectible";
import {
  CreateCollectionOptions,
  CreateSingleOptions,
  StoreInitOptions,
} from "@3land/listings-sdk/dist/types/implementation/implementationTypes";

/**
 * Main class for interacting with Solana blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SolanaAgentKit
 * @property {Connection} connection - Solana RPC connection
 * @property {Keypair} wallet - Wallet keypair for signing transactions
 * @property {PublicKey} wallet_address - Public key of the wallet
 * @property {Config} config - Configuration object
 */
export class SolanaAgentKit {
  public connection: Connection;
  public wallet: Keypair;
  public wallet_address: PublicKey;
  public config: Config;

  /**
   * @deprecated Using openai_api_key directly in constructor is deprecated.
   * Please use the new constructor with Config object instead:
   * @example
   * const agent = new SolanaAgentKit(privateKey, rpcUrl, {
   *   OPENAI_API_KEY: 'your-key'
   * });
   */
  constructor(
    private_key: string,
    rpc_url: string,
    openai_api_key: string | null,
  );
  constructor(private_key: string, rpc_url: string, config: Config);
  constructor(
    private_key: string,
    rpc_url: string,
    configOrKey: Config | string | null,
  ) {
    this.connection = new Connection(
      rpc_url || "https://api.mainnet-beta.solana.com",
    );
    this.wallet = Keypair.fromSecretKey(bs58.decode(private_key));
    this.wallet_address = this.wallet.publicKey;

    // Handle both old and new patterns
    if (typeof configOrKey === "string" || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || "" };
    } else {
      this.config = configOrKey;
    }
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

  async getBalanceOther(
    walletAddress: PublicKey,
    tokenAddress?: PublicKey,
  ): Promise<number> {
    return get_balance_other(this, walletAddress, tokenAddress);
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

  async limitOrder(
    marketId: PublicKey,
    quantity: number,
    side: string,
    price: number,
  ): Promise<string> {
    return limitOrder(this, marketId, quantity, side, price);
  }

  async batchOrder(
    marketId: PublicKey,
    orders: OrderParams[],
  ): Promise<string> {
    return batchOrder(this, marketId, orders);
  }

  async cancelAllOrders(marketId: PublicKey): Promise<string> {
    return cancelAllOrders(this, marketId);
  }

  async withdrawAll(marketId: PublicKey): Promise<string> {
    return withdrawAll(this, marketId);
  }

  async openPerpTradeLong(
    args: Omit<Parameters<typeof openPerpTradeLong>[0], "agent">,
  ): Promise<string> {
    return openPerpTradeLong({
      agent: this,
      ...args,
    });
  }

  async openPerpTradeShort(
    args: Omit<Parameters<typeof openPerpTradeShort>[0], "agent">,
  ): Promise<string> {
    return openPerpTradeShort({
      agent: this,
      ...args,
    });
  }

  async closePerpTradeShort(
    args: Omit<Parameters<typeof closePerpTradeShort>[0], "agent">,
  ): Promise<string> {
    return closePerpTradeShort({
      agent: this,
      ...args,
    });
  }

  async closePerpTradeLong(
    args: Omit<Parameters<typeof closePerpTradeLong>[0], "agent">,
  ): Promise<string> {
    return closePerpTradeLong({
      agent: this,
      ...args,
    });
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

  async restake(amount: number): Promise<string> {
    return stakeWithSolayer(this, amount);
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

  async orcaClosePosition(positionMintAddress: PublicKey) {
    return orcaClosePosition(this, positionMintAddress);
  }

  async orcaCreateCLMM(
    mintDeploy: PublicKey,
    mintPair: PublicKey,
    initialPrice: Decimal,
    feeTier: keyof typeof FEE_TIERS,
  ) {
    return orcaCreateCLMM(this, mintDeploy, mintPair, initialPrice, feeTier);
  }

  async orcaCreateSingleSidedLiquidityPool(
    depositTokenAmount: number,
    depositTokenMint: PublicKey,
    otherTokenMint: PublicKey,
    initialPrice: Decimal,
    maxPrice: Decimal,
    feeTier: keyof typeof FEE_TIERS,
  ) {
    return orcaCreateSingleSidedLiquidityPool(
      this,
      depositTokenAmount,
      depositTokenMint,
      otherTokenMint,
      initialPrice,
      maxPrice,
      feeTier,
    );
  }

  async orcaFetchPositions() {
    return orcaFetchPositions(this);
  }

  async orcaOpenCenteredPositionWithLiquidity(
    whirlpoolAddress: PublicKey,
    priceOffsetBps: number,
    inputTokenMint: PublicKey,
    inputAmount: Decimal,
  ) {
    return orcaOpenCenteredPositionWithLiquidity(
      this,
      whirlpoolAddress,
      priceOffsetBps,
      inputTokenMint,
      inputAmount,
    );
  }

  async orcaOpenSingleSidedPosition(
    whirlpoolAddress: PublicKey,
    distanceFromCurrentPriceBps: number,
    widthBps: number,
    inputTokenMint: PublicKey,
    inputAmount: Decimal,
  ): Promise<string> {
    return orcaOpenSingleSidedPosition(
      this,
      whirlpoolAddress,
      distanceFromCurrentPriceBps,
      widthBps,
      inputTokenMint,
      inputAmount,
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

  async getAllDomainsTLDs(): Promise<string[]> {
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

  async manifestCreateMarket(
    baseMint: PublicKey,
    quoteMint: PublicKey,
  ): Promise<string[]> {
    return manifestCreateMarket(this, baseMint, quoteMint);
  }

  async getPythPriceFeedID(tokenSymbol: string): Promise<string> {
    return fetchPythPriceFeedID(tokenSymbol);
  }

  async getPythPrice(priceFeedID: string): Promise<string> {
    return fetchPythPrice(priceFeedID);
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

  async tensorListNFT(nftMint: PublicKey, price: number): Promise<string> {
    return listNFTForSale(this, nftMint, price);
  }

  async tensorCancelListing(nftMint: PublicKey): Promise<string> {
    return cancelListing(this, nftMint);
  }

  async fetchTokenReportSummary(mint: string): Promise<TokenCheck> {
    return fetchTokenReportSummary(mint);
  }

  async fetchTokenDetailedReport(mint: string): Promise<TokenCheck> {
    return fetchTokenDetailedReport(mint);
  }

  /**
   * Opens a new trading position on Flash.Trade
   * @param params Flash trade parameters including market, side, collateral, leverage, and pool name
   * @returns Transaction signature
   */
  async flashOpenTrade(params: FlashTradeParams): Promise<string> {
    return flashOpenTrade(this, params);
  }

  /**
   * Closes an existing trading position on Flash.Trade
   * @param params Flash trade close parameters
   * @returns Transaction signature
   */
  async flashCloseTrade(params: FlashCloseTradeParams): Promise<string> {
    return flashCloseTrade(this, params);
  }

  async create3LandCollection(
    optionsWithBase58: StoreInitOptions,
    collectionOpts: CreateCollectionOptions,
  ): Promise<string> {
    const tx = await createCollection(optionsWithBase58, collectionOpts);
    return `Transaction: ${tx}`;
  }

  async create3LandNft(
    optionsWithBase58: StoreInitOptions,
    collectionAccount: string,
    createItemOptions: CreateSingleOptions,
    isMainnet: boolean,
  ): Promise<string> {
    const tx = await createSingle(
      optionsWithBase58,
      collectionAccount,
      createItemOptions,
      isMainnet,
    );
    return `Transaction: ${tx}`;
  }
}
