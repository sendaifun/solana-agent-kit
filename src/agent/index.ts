import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  request_faucet_funds,
  deploy_token,
  deploy_collection,
  get_balance,
  mintCollectionNFT,
  transfer,
  trade,
  registerDomain,
  launchPumpFunToken,
  stakeWithJup,
} from "../tools";
import { CollectionOptions, PumpFunTokenOptions } from "../types";
import { DEFAULT_OPTIONS } from "../constants";

/**
 * Main class for interacting with Solana blockchain
 * Provides a unified interface for token operations, NFT management, and trading
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
    openai_api_key: string
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
    decimals: number = DEFAULT_OPTIONS.TOKEN_DECIMALS
    // initialSupply?: number
  ) {
    return deploy_token(this, decimals);
  }

  async deployCollection(options: CollectionOptions) {
    return deploy_collection(this, options);
  }

  async getBalance(token_address?: PublicKey) {
    return get_balance(this, token_address);
  }

  async mintNFT(
    collectionMint: PublicKey,
    metadata: Parameters<typeof mintCollectionNFT>[2],
    recipient?: PublicKey
  ) {
    return mintCollectionNFT(this, collectionMint, metadata, recipient);
  }

  async transfer(to: PublicKey, amount: number, mint?: PublicKey) {
    return transfer(this, to, amount, mint);
  }

  async registerDomain(name: string, spaceKB?: number) {
    return registerDomain(this, name, spaceKB);
  }

  async trade(
    outputMint: PublicKey,
    inputAmount: number,
    inputMint?: PublicKey,
    slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS
  ) {
    return trade(this, outputMint, inputAmount, inputMint, slippageBps);
  }

  async launchPumpFunToken(
    tokenName: string,
    tokenTicker: string,
    description: string,
    imageUrl: string,
    options?: PumpFunTokenOptions 
  ) {
    return launchPumpFunToken(
      this,
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      options
    );
  }
  
  async stake(
    amount: number,
  ) {
    return stakeWithJup(this, amount);
  }
}
