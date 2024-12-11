import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../index";
import { PublicKey } from "@solana/web3.js";
import { toJSON } from "../utils/toJSON";
import { create_image } from "../tools/create_image";

export class SolanaBalanceTool extends Tool {
  name = "solana_balance";
  description = `Get the balance of a Solana wallet or token account.

  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  If no tokenAddress is provided, the balance will be in SOL.

  Inputs:
  tokenAddress: string, eg "So11111111111111111111111111111111111111112" (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const tokenAddress = input ? new PublicKey(input) : undefined;
      const balance = await this.solanaKit.getBalance(tokenAddress);

      return JSON.stringify({
        status: "success",
        balance: balance,
        token: input || "SOL",
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTransferTool extends Tool {
  name = "solana_transfer";
  description = `Transfer tokens or SOL to another address ( also called as wallet address ).

  Inputs ( input is a JSON string ):
  to: string, eg "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk" (required)
  amount: number, eg 1 (required)
  mint?: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      console.log(parsedInput);

      const recipient = new PublicKey(parsedInput.to);
      const mintAddress = parsedInput.mint
        ? new PublicKey(parsedInput.mint)
        : undefined;

      const tx = await this.solanaKit.transfer(
        recipient,
        parsedInput.amount,
        mintAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "Transfer completed successfully",
        amount: parsedInput.amount,
        recipient: parsedInput.to,
        token: parsedInput.mint || "SOL",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaDeployTokenTool extends Tool {
  name = "solana_deploy_token";
  description =
    "Deploy a new SPL token. Input should be JSON string with: {decimals?: number, initialSupply?: number}";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (
      input.decimals !== undefined &&
      (typeof input.decimals !== "number" ||
        input.decimals < 0 ||
        input.decimals > 9)
    ) {
      throw new Error(
        "decimals must be a number between 0 and 9 when provided",
      );
    }
    if (
      input.initialSupply !== undefined &&
      (typeof input.initialSupply !== "number" || input.initialSupply <= 0)
    ) {
      throw new Error("initialSupply must be a positive number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = toJSON(input);
      this.validateInput(parsedInput);

      const result = await this.solanaKit.deployToken(parsedInput.decimals);

      return JSON.stringify({
        status: "success",
        message: "Token deployed successfully",
        mintAddress: result.mint.toString(),
        decimals: parsedInput.decimals || 9,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaDeployCollectionTool extends Tool {
  name = "solana_deploy_collection";
  description =
    "Deploy a new NFT collection. Input should be JSON with: {name: string, uri: string, royaltyBasisPoints?: number, creators?: Array<{address: string, percentage: number}>}";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (!input.name || typeof input.name !== "string") {
      throw new Error("name is required and must be a string");
    }
    if (!input.uri || typeof input.uri !== "string") {
      throw new Error("uri is required and must be a string");
    }
    if (
      input.royaltyBasisPoints !== undefined &&
      (typeof input.royaltyBasisPoints !== "number" ||
        input.royaltyBasisPoints < 0 ||
        input.royaltyBasisPoints > 10000)
    ) {
      throw new Error(
        "royaltyBasisPoints must be a number between 0 and 10000 when provided",
      );
    }
    if (input.creators) {
      if (!Array.isArray(input.creators)) {
        throw new Error("creators must be an array when provided");
      }
      input.creators.forEach((creator: any, index: number) => {
        if (!creator.address || typeof creator.address !== "string") {
          throw new Error(
            `creator[${index}].address is required and must be a string`,
          );
        }
        if (
          typeof creator.percentage !== "number" ||
          creator.percentage < 0 ||
          creator.percentage > 100
        ) {
          throw new Error(
            `creator[${index}].percentage must be a number between 0 and 100`,
          );
        }
      });
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = toJSON(input);
      this.validateInput(parsedInput);

      const result = await this.solanaKit.deployCollection(parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Collection deployed successfully",
        collectionAddress: result.collectionAddress.toString(),
        name: parsedInput.name,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaMintNFTTool extends Tool {
  name = "solana_mint_nft";
  description =
    "Mint a new NFT in a collection. Input should be JSON with: {collectionMint: string, metadata: {name: string, symbol: string, uri: string}, recipient?: string}";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (!input.collectionMint || typeof input.collectionMint !== "string") {
      throw new Error("collectionMint is required and must be a string");
    }
    if (!input.metadata || typeof input.metadata !== "object") {
      throw new Error("metadata is required and must be an object");
    }
    if (!input.metadata.name || typeof input.metadata.name !== "string") {
      throw new Error("metadata.name is required and must be a string");
    }
    if (!input.metadata.symbol || typeof input.metadata.symbol !== "string") {
      throw new Error("metadata.symbol is required and must be a string");
    }
    if (!input.metadata.uri || typeof input.metadata.uri !== "string") {
      throw new Error("metadata.uri is required and must be a string");
    }
    if (input.recipient !== undefined && typeof input.recipient !== "string") {
      throw new Error("recipient must be a string when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = toJSON(input);
      this.validateInput(parsedInput);

      const result = await this.solanaKit.mintNFT(
        new PublicKey(parsedInput.collectionMint),
        parsedInput.metadata,
        parsedInput.recipient
          ? new PublicKey(parsedInput.recipient)
          : undefined,
      );

      return JSON.stringify({
        status: "success",
        message: "NFT minted successfully",
        mintAddress: result.mint.toString(),
        name: parsedInput.metadata.name,
        recipient: parsedInput.recipient || result.mint.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTradeTool extends Tool {
  name = "solana_trade";
  description = `This tool can be used to swap tokens to another token ( It uses Jupiter Exchange ).

  Inputs ( input is a JSON string ):
  outputMint: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (required)
  inputAmount: number, eg 1 or 0.01 (required)
  inputMint?: string, eg "So11111111111111111111111111111111111111112" (optional)
  slippageBps?: number, eg 100 (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tx = await this.solanaKit.trade(
        new PublicKey(parsedInput.outputMint),
        parsedInput.inputAmount,
        parsedInput.inputMint
          ? new PublicKey(parsedInput.inputMint)
          : new PublicKey("So11111111111111111111111111111111111111112"),
        parsedInput.slippageBps,
      );

      return JSON.stringify({
        status: "success",
        message: "Trade executed successfully",
        transaction: tx,
        inputAmount: parsedInput.inputAmount,
        inputToken: parsedInput.inputMint || "SOL",
        outputToken: parsedInput.outputMint,
      });
    } catch (error: any) {
      console.log(error);
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRequestFundsTool extends Tool {
  name = "solana_request_funds";
  description = "Request SOL from Solana faucet (devnet/testnet only)";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      await this.solanaKit.requestFaucetFunds();

      return JSON.stringify({
        status: "success",
        message: "Successfully requested faucet funds",
        network: this.solanaKit.connection.rpcEndpoint.split("/")[2],
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRegisterDomainTool extends Tool {
  name = "solana_register_domain";
  description = `Register a .sol domain name for your wallet.

  Inputs:
  name: string, eg "pumpfun.sol" (required)
  spaceKB: number, eg 1 (optional, default is 1)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (!input.name || typeof input.name !== "string") {
      throw new Error("name is required and must be a string");
    }
    if (
      input.spaceKB !== undefined &&
      (typeof input.spaceKB !== "number" || input.spaceKB <= 0)
    ) {
      throw new Error("spaceKB must be a positive number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = toJSON(input);
      this.validateInput(parsedInput);

      const tx = await this.solanaKit.registerDomain(
        parsedInput.name,
        parsedInput.spaceKB || 1,
      );

      return JSON.stringify({
        status: "success",
        message: "Domain registered successfully",
        transaction: tx,
        domain: `${parsedInput.name}.sol`,
        spaceKB: parsedInput.spaceKB || 1,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaGetWalletAddressTool extends Tool {
  name = "solana_get_wallet_address";
  description = `Get the wallet address of the agent`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    return this.solanaKit.wallet_address.toString();
  }
}

export class SolanaPumpfunTokenLaunchTool extends Tool {
  name = "solana_launch_pumpfun_token";

  description = `This tool can be used to launch a token on Pump.fun,
   do not use this tool for any other purpose, or for creating SPL tokens.
   If the user asks you to chose the parameters, you should generate valid values.
   For generating the image, you can use the solana_create_image tool.

   Inputs:
   tokenName: string, eg "PumpFun Token",
   tokenTicker: string, eg "PUMP",
   description: string, eg "PumpFun Token is a token on the Solana blockchain",
   imageUrl: string, eg "https://i.imgur.com/UFm07Np_d.png`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    console.log(input);
    if (!input.tokenName || typeof input.tokenName !== "string") {
      throw new Error("tokenName is required and must be a string");
    }
    if (!input.tokenTicker || typeof input.tokenTicker !== "string") {
      throw new Error("tokenTicker is required and must be a string");
    }
    if (!input.description || typeof input.description !== "string") {
      throw new Error("description is required and must be a string");
    }
    if (!input.imageUrl || typeof input.imageUrl !== "string") {
      throw new Error("imageUrl is required and must be a string");
    }
    if (
      input.initialLiquiditySOL !== undefined &&
      typeof input.initialLiquiditySOL !== "number"
    ) {
      throw new Error("initialLiquiditySOL must be a number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      // Parse and normalize input
      input = input.trim();
      let parsedInput = JSON.parse(input);

      this.validateInput(parsedInput);

      // Launch token with validated input
      await this.solanaKit.launchPumpFunToken(
        parsedInput.tokenName,
        parsedInput.tokenTicker,
        parsedInput.description,
        parsedInput.imageUrl,
        {
          twitter: parsedInput.twitter,
          telegram: parsedInput.telegram,
          website: parsedInput.website,
          initialLiquiditySOL: parsedInput.initialLiquiditySOL,
        },
      );

      return JSON.stringify({
        status: "success",
        message: "Token launched successfully on Pump.fun",
        tokenName: parsedInput.tokenName,
        tokenTicker: parsedInput.tokenTicker,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaCreateImageTool extends Tool {
  name = "solana_create_image";
  description =
    "Create an image using OpenAI's DALL-E. Input should be a string prompt for the image.";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: string): void {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Input must be a non-empty string prompt");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      this.validateInput(input);
      const result = await create_image(this.solanaKit, input.trim());

      return JSON.stringify({
        status: "success",
        message: "Image created successfully",
        ...result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaStakeTool extends Tool {
  name = "solana_stake";
  description = `This tool can be used to stake your SOL (Solana)

  Inputs ( input is a JSON string ):
  amount: number, eg 1 or 0.01 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (
      input.amount !== undefined &&
      (typeof input.amount !== "number" || input.amount <= 0)
    ) {
      throw new Error("amount must be a positive number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = toJSON(input);
      this.validateInput(parsedInput);

      const tx = await this.solanaKit.stake(parsedInput.amount);

      return JSON.stringify({
        status: "success",
        message: "Staked successfully",
        transaction: tx,
        amount: parsedInput.amount,
      });
    } catch (error: any) {
      console.log(error);
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export function createSolanaTools(solanaKit: SolanaAgentKit) {
  return [
    new SolanaBalanceTool(solanaKit),
    new SolanaTransferTool(solanaKit),
    new SolanaDeployTokenTool(solanaKit),
    new SolanaDeployCollectionTool(solanaKit),
    new SolanaMintNFTTool(solanaKit),
    new SolanaTradeTool(solanaKit),
    new SolanaRequestFundsTool(solanaKit),
    new SolanaRegisterDomainTool(solanaKit),
    new SolanaGetWalletAddressTool(solanaKit),
    new SolanaPumpfunTokenLaunchTool(solanaKit),
    new SolanaCreateImageTool(solanaKit),
    new SolanaStakeTool(solanaKit),
  ];
}
