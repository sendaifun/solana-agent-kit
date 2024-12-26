import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { Tool } from "langchain/tools";
import {
  GibworkCreateTaskReponse,
  PythFetchPriceResponse,
  SolanaAgentKit,
} from "../index";
import { create_image } from "../tools/create_image";
import { BN } from "@coral-xyz/anchor";
import { FEE_TIERS } from "../tools";
import { toJSON } from "../utils/toJSON";
import {
  Action,
  ActionExample,
  ActionResult,
  Handler,
  Validator,
} from "../types";

export class SolanaBalanceTool extends Tool implements Action {
  name = "solana_balance";
  similes = ["check_balance", "get_wallet_balance"];
  description = `Get the balance of a Solana wallet or token account.

  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  If no tokenAddress is provided, the balance will be in SOL.

  Inputs:
  tokenAddress: string, eg "So11111111111111111111111111111111111111112" (optional)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: { text: "Get my balance" },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: { success: true, data: { balance: "100 SOL" } },
      },
    ],
  ];

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

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    return typeof input === "string";
  };
}

export class SolanaTransferTool extends Tool implements Action {
  name = "solana_transfer";
  similes = ["send_tokens", "transfer_sol"];
  description = `Transfer tokens or SOL to another address ( also called as wallet address ).

  Inputs ( input is a JSON string ):
  to: string, eg "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk" (required)
  amount: number, eg 1 (required)
  mint?: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                to: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
                amount: 1,
                mint: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: { success: true, data: { transactionId: "5G9f8..." } },
      },
    ],
  ];
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

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

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.to === "string" &&
        typeof parsedInput.amount === "number" &&
        (parsedInput.mint === undefined || typeof parsedInput.mint === "string")
      );
    } catch {
      return false;
    }
  };
}

export class SolanaDeployTokenTool extends Tool implements Action {
  name = "solana_deploy_token";
  similes = ["create_token", "deploy_token"];
  description = `Deploy a new token on Solana blockchain.

  Inputs (input is a JSON string):
  name: string, eg "My Token" (required)
  uri: string, eg "https://example.com/token.json" (required)
  symbol: string, eg "MTK" (required)
  decimals?: number, eg 9 (optional, defaults to 9)
  initialSupply?: number, eg 1000000 (optional)`;

  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                name: "MyToken",
                symbol: "MTK",
                decimals: 9,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tokenAddress: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.deployToken(
        parsedInput.name,
        parsedInput.uri,
        parsedInput.symbol,
        parsedInput.decimals,
        parsedInput.initialSupply,
      );

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

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.name === "string" &&
        typeof parsedInput.symbol === "string" &&
        typeof parsedInput.decimals === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaDeployCollectionTool extends Tool implements Action {
  name = "solana_deploy_collection";
  similes = ["create_collection", "deploy_collection"];
  description = `Deploy a new NFT collection on Solana blockchain.

  Inputs (input is a JSON string):
  name: string, eg "My Collection" (required)
  uri: string, eg "https://example.com/collection.json" (required)
  royaltyBasisPoints?: number, eg 500 for 5% (optional)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                name: "MyCollection",
                symbol: "MC",
                uri: "https://example.com/metadata.json",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            collectionAddress: "So11111111111111111111111111111111111111112",
          },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

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

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.name === "string" &&
        typeof parsedInput.symbol === "string" &&
        typeof parsedInput.uri === "string"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaMintNFTTool extends Tool implements Action {
  name = "solana_mint_nft";
  similes = ["create_nft", "mint_nft"];
  description = `Mint a new NFT in a collection on Solana blockchain.

    Inputs (input is a JSON string):
    collectionMint: string, eg "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w" (required) - The address of the collection to mint into
    name: string, eg "My NFT" (required)
    uri: string, eg "https://example.com/nft.json" (required)
    recipient?: string, eg "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u" (optional) - The wallet to receive the NFT, defaults to agent's wallet which is ${this.solanaKit.wallet_address.toString()}`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                collectionAddress:
                  "So11111111111111111111111111111111111111112",
                uri: "https://example.com/metadata.json",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { nftAddress: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ];
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.mintNFT(
        new PublicKey(parsedInput.collectionMint),
        {
          name: parsedInput.name,
          uri: parsedInput.uri,
        },
        parsedInput.recipient
          ? new PublicKey(parsedInput.recipient)
          : this.solanaKit.wallet_address,
      );

      return JSON.stringify({
        status: "success",
        message: "NFT minted successfully",
        mintAddress: result.mint.toString(),
        metadata: {
          name: parsedInput.name,
          symbol: parsedInput.symbol,
          uri: parsedInput.uri,
        },
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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.collectionAddress === "string" &&
        typeof parsedInput.uri === "string"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaTradeTool extends Tool implements Action {
  name = "solana_trade";
  similes = ["swap_tokens", "trade_tokens"];
  description = `This tool can be used to swap tokens to another token ( It uses Jupiter Exchange ).

  Inputs ( input is a JSON string ):
  outputMint: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (required)
  inputAmount: number, eg 1 or 0.01 (required)
  inputMint?: string, eg "So11111111111111111111111111111111111111112" (optional)
  slippageBps?: number, eg 100 (optional)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                outputMint: "So11111111111111111111111111111111111111112",
                inputAmount: 1,
                inputMint: "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa",
                slippageBps: 100,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ];

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
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.outputMint === "string" &&
        typeof parsedInput.inputAmount === "number" &&
        (parsedInput.inputMint === undefined || typeof parsedInput.inputMint === "string") &&
        (parsedInput.slippageBps === undefined || typeof parsedInput.slippageBps === "number")
      );
    } catch {
      return false;
    }
  };
}

export class SolanaRequestFundsTool extends Tool implements Action {
  name = "solana_request_funds";
  similes = ["request_airdrop", "get_test_tokens"];
  description = "Request SOL from Solana faucet (devnet/testnet only)";
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                amount: 1,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ];

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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.amount === "number";
    } catch {
      return false;
    }
  };
}

export class SolanaRegisterDomainTool extends Tool implements Action {
  name = "solana_register_domain";
  similes = ["register_domain", "create_domain"];
  description = `Register a .sol domain name for your wallet.

  Inputs:
  name: string, eg "pumpfun.sol" (required)
  spaceKB: number, eg 1 (optional, default is 1)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                domain: "example.sol",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            domainAddress: "So11111111111111111111111111111111111111112",
          },
        },
      },
    ],
  ];

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

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      this.validateInput(input);
      return true;
    } catch {
      return false;
    }
  };
}

export class SolanaResolveDomainTool extends Tool implements Action {
  name = "solana_resolve_domain";
  similes = ["resolve_domain", "get_domain_address"];
  description = `Resolve ONLY .sol domain names to a Solana PublicKey.
  This tool is exclusively for .sol domains.
  DO NOT use this for other domain types like .blink, .bonk, etc.

  Inputs:
  domain: string, eg "pumpfun.sol" (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                domain: "example.sol",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { address: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const domain = input.trim();
      const publicKey = await this.solanaKit.resolveSolDomain(domain);

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        publicKey: publicKey.toBase58(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.domain === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaGetDomainTool extends Tool implements Action {
  name = "solana_get_domain";
  similes = ["get_domain", "fetch_domain"];
  description = `Retrieve the .sol domain associated for a given account address.

  Inputs:
  account: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                address: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { domain: "example.sol" },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const account = new PublicKey(input.trim());
      const domain = await this.solanaKit.getPrimaryDomain(account);

      return JSON.stringify({
        status: "success",
        message: "Primary domain retrieved successfully",
        domain,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.address === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaGetWalletAddressTool extends Tool implements Action {
  name = "solana_get_wallet_address";
  similes = ["get_wallet_address", "fetch_wallet_address"];
  description = `Get the wallet address of the agent`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: "",
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            walletAddress: "So11111111111111111111111111111111111111112",
          },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    return this.solanaKit.wallet_address.toString();
  }

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async () => {
    return true;
  };
}

export class SolanaPumpfunTokenLaunchTool extends Tool implements Action {
  name = "solana_launch_pumpfun_token";
  similes = ["launch_token", "create_token"];
  description = `This tool can be used to launch a token on Pump.fun,
   do not use this tool for any other purpose, or for creating SPL tokens.
   If the user asks you to chose the parameters, you should generate valid values.
   For generating the image, you can use the solana_create_image tool.

   Inputs:
   tokenName: string, eg "PumpFun Token",
   tokenTicker: string, eg "PUMP",
   description: string, eg "PumpFun Token is a token on the Solana blockchain",
   imageUrl: string, eg "https://i.imgur.com/UFm07Np_d.png`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                name: "PumpfunToken",
                symbol: "PFT",
                decimals: 9,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tokenAddress: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
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
      const parsedInput = JSON.parse(input);

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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      this.validateInput(input);
      return true;
    } catch {
      return false;
    }
  };
}

export class SolanaCreateImageTool extends Tool implements Action {
  name = "solana_create_image";
  similes = ["generate_image", "create_image"];
  description =
    "Create an image using OpenAI's DALL-E. Input should be a string prompt for the image.";
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                prompt: "A futuristic cityscape",
                width: 1024,
                height: 768,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { imageUrl: "https://example.com/image.png" },
        },
      },
    ],
  ];

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

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      this.validateInput(input);
      return true;
    } catch {
      return false;
    }
  };
}

export class SolanaLendAssetTool extends Tool implements Action {
  name = "solana_lend_asset";
  similes = ["lend_asset", "provide_liquidity"];
  description = `Lend idle USDC for yield using Lulo. ( only USDC is supported )

  Inputs (input is a json string):
  amount: number, eg 1, 0.01 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                asset: "So11111111111111111111111111111111111111112",
                amount: 100,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ];

  async _call(input: string): Promise<string> {
    try {
      const amount = JSON.parse(input).amount || input;

      const tx = await this.solanaKit.lendAssets(amount);

      return JSON.stringify({
        status: "success",
        message: "Asset lent successfully",
        transaction: tx,
        amount: amount,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.asset === "string" &&
        typeof parsedInput.amount === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaTPSCalculatorTool extends Tool implements Action {
  name = "solana_get_tps";
  similes = ["calculate_tps", "get_tps"];
  description = "Get the current TPS of the Solana network";
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                startTime: 1633046400,
                endTime: 1633046500,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tps: 1500 },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      const tps = await this.solanaKit.getTPS();
      return `Solana (mainnet-beta) current transactions per second: ${tps}`;
    } catch (error: any) {
      return `Error fetching TPS: ${error.message}`;
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.startTime === "number" &&
        typeof parsedInput.endTime === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaStakeTool extends Tool implements Action {
  name = "solana_stake";
  similes = ["stake_tokens", "delegate_tokens"];
  description = `This tool can be used to stake your SOL (Solana), also called as SOL staking or liquid staking.

  Inputs ( input is a JSON string ):
  amount: number, eg 1 or 0.01 (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                amount: 100,
                validator: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input) || Number(input);

      const tx = await this.solanaKit.stake(parsedInput.amount);

      return JSON.stringify({
        status: "success",
        message: "Staked successfully",
        transaction: tx,
        amount: parsedInput.amount,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.amount === "number" &&
        typeof parsedInput.validator === "string"
      );
    } catch {
      return false;
    }
  };
}

/**
 * Tool to fetch the price of a token in USDC
 */
export class SolanaFetchPriceTool extends Tool implements Action {
  name = "solana_fetch_price";
  similes = ["get_price", "fetch_token_price"];
  description = `Fetch the price of a given token in USDC.

  Inputs:
  - tokenId: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"`;

  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenAddress: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { price: 150.25 },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const price = await this.solanaKit.fetchTokenPrice(input.trim());
      return JSON.stringify({
        status: "success",
        tokenId: input.trim(),
        priceInUSDC: price,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.tokenAddress === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaTokenDataTool extends Tool implements Action {
  name = "solana_token_data";
  similes = ["get_token_data", "fetch_token_data"];
  description = `Get the token data for a given token mint address

  Inputs: mintAddress is required.
  mintAddress: string, eg "So11111111111111111111111111111111111111112" (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenAddress: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            name: "Example Token",
            symbol: "EXT",
            decimals: 9,
            supply: "1000000000",
          },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = input.trim();

      const tokenData = await this.solanaKit.getTokenDataByAddress(parsedInput);

      return JSON.stringify({
        status: "success",
        tokenData: tokenData,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.tokenAddress === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaTokenDataByTickerTool extends Tool implements Action {
  name = "solana_token_data_by_ticker";
  similes = ["get_token_data_by_ticker", "fetch_token_data_by_ticker"];
  description = `Get the token data for a given token ticker

  Inputs: ticker is required.
  ticker: string, eg "USDC" (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                ticker: "SOL",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            name: "Solana",
            symbol: "SOL",
            decimals: 9,
            supply: "1000000000",
          },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const ticker = input.trim();
      const tokenData = await this.solanaKit.getTokenDataByTicker(ticker);
      return JSON.stringify({
        status: "success",
        tokenData: tokenData,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.ticker === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaCompressedAirdropTool extends Tool implements Action {
  name = "solana_compressed_airdrop";
  similes = ["compressed_airdrop", "airdrop_tokens"];
  description = `Airdrop SPL tokens with ZK Compression (also called as airdropping tokens)

  Inputs (input is a JSON string):
  mintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, the amount of tokens to airdrop per recipient, e.g., 42 (required)
  decimals: number, the decimals of the token, e.g., 6 (required)
  recipients: string[], the recipient addresses, e.g., ["1nc1nerator11111111111111111111111111111111"] (required)
  priorityFeeInLamports: number, the priority fee in lamports. Default is 30_000. (optional)
  shouldLog: boolean, whether to log progress to stdout. Default is false. (optional)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                recipients: [
                  "So11111111111111111111111111111111111111112",
                  "So22222222222222222222222222222222222222222",
                ],
                amount: 100,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const txs = await this.solanaKit.sendCompressedAirdrop(
        parsedInput.mintAddress,
        parsedInput.amount,
        parsedInput.decimals,
        parsedInput.recipients,
        parsedInput.priorityFeeInLamports || 30_000,
        parsedInput.shouldLog || false,
      );

      return JSON.stringify({
        status: "success",
        message: `Airdropped ${parsedInput.amount} tokens to ${parsedInput.recipients.length} recipients.`,
        transactionHashes: txs,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        Array.isArray(parsedInput.recipients) &&
        parsedInput.recipients.every((recipient: any) => typeof recipient === "string") &&
        typeof parsedInput.amount === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaCreateSingleSidedWhirlpoolTool extends Tool implements Action {
  name = "create_orca_single_sided_whirlpool";
  similes = ["create_whirlpool", "single_sided_whirlpool"];
  description = `Create a single-sided Whirlpool with liquidity.

  Inputs (input is a JSON string):
  - depositTokenAmount: number, eg: 1000000000 (required, in units of deposit token including decimals)
  - depositTokenMint: string, eg: "DepositTokenMintAddress" (required, mint address of deposit token)
  - otherTokenMint: string, eg: "OtherTokenMintAddress" (required, mint address of other token)
  - initialPrice: number, eg: 0.001 (required, initial price of deposit token in terms of other token)
  - maxPrice: number, eg: 5.0 (required, maximum price at which liquidity is added)
  - feeTier: number, eg: 0.30 (required, fee tier for the pool)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenA: "So11111111111111111111111111111111111111112",
                amountA: 100,
                tokenB: "So22222222222222222222222222222222222222222",
                amountB: 200,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { poolAddress: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const depositTokenAmount = new BN(inputFormat.depositTokenAmount);
      const depositTokenMint = new PublicKey(inputFormat.depositTokenMint);
      const otherTokenMint = new PublicKey(inputFormat.otherTokenMint);
      const initialPrice = new Decimal(inputFormat.initialPrice);
      const maxPrice = new Decimal(inputFormat.maxPrice);
      const feeTier = inputFormat.feeTier;

      if (!feeTier || !(feeTier in FEE_TIERS)) {
        throw new Error(
          `Invalid feeTier. Available options: ${Object.keys(FEE_TIERS).join(
            ", ",
          )}`,
        );
      }

      const txId = await this.solanaKit.createOrcaSingleSidedWhirlpool(
        depositTokenAmount,
        depositTokenMint,
        otherTokenMint,
        initialPrice,
        maxPrice,
        feeTier,
      );

      return JSON.stringify({
        status: "success",
        message: "Single-sided Whirlpool created successfully",
        transaction: txId,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.tokenA === "string" &&
        typeof parsedInput.amountA === "number" &&
        typeof parsedInput.tokenB === "string" &&
        typeof parsedInput.amountB === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaRaydiumCreateAmmV4 extends Tool implements Action {
  name = "raydium_create_ammV4";
  similes = ["create_amm_v4", "raydium_create_amm"];
  description = `Raydium's Legacy AMM that requiers an OpenBook marketID

  Inputs (input is a json string):
  marketId: string (required)
  baseAmount: number(int), eg: 111111 (required)
  quoteAmount: number(int), eg: 111111 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenA: "So11111111111111111111111111111111111111112",
                amountA: 100,
                tokenB: "So22222222222222222222222222222222222222222",
                amountB: 200,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { poolAddress: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateAmmV4(
        new PublicKey(inputFormat.marketId),
        new BN(inputFormat.baseAmount),
        new BN(inputFormat.quoteAmount),
        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Create raydium amm v4 pool successfully",
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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.tokenA === "string" &&
        typeof parsedInput.amountA === "number" &&
        typeof parsedInput.tokenB === "string" &&
        typeof parsedInput.amountB === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaRaydiumCreateClmm extends Tool implements Action {
  name = "raydium_create_clmm";
  similes = ["create_clmm", "raydium_create_clmm"];
  description = `Concentrated liquidity market maker, custom liquidity ranges, increased capital efficiency

  Inputs (input is a json string):
  mint1: string (required)
  mint2: string (required)
  configId: string (required) stores pool info, id, index, protocolFeeRate, tradeFeeRate, tickSpacing, fundFeeRate
  initialPrice: number, eg: 123.12 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenA: "So11111111111111111111111111111111111111112",
                amountA: 100,
                tokenB: "So22222222222222222222222222222222222222222",
                amountB: 200,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { poolAddress: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateClmm(
        new PublicKey(inputFormat.mint1),
        new PublicKey(inputFormat.mint2),

        new PublicKey(inputFormat.configId),

        new Decimal(inputFormat.initialPrice),
        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Create raydium clmm pool successfully",
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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.tokenA === "string" &&
        typeof parsedInput.amountA === "number" &&
        typeof parsedInput.tokenB === "string" &&
        typeof parsedInput.amountB === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaRaydiumCreateCpmm extends Tool implements Action {
  name = "raydium_create_cpmm";
  similes = ["create_cpmm", "raydium_create_cpmm"];
  description = `Raydium's newest CPMM, does not require marketID, supports Token 2022 standard

  Inputs (input is a json string):
  mint1: string (required)
  mint2: string (required)
  configId: string (required), stores pool info, index, protocolFeeRate, tradeFeeRate, fundFeeRate, createPoolFee
  mintAAmount: number(int), eg: 1111 (required)
  mintBAmount: number(int), eg: 2222 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenA: "So11111111111111111111111111111111111111112",
                amountA: 100,
                tokenB: "So22222222222222222222222222222222222222222",
                amountB: 200,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { poolAddress: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateCpmm(
        new PublicKey(inputFormat.mint1),
        new PublicKey(inputFormat.mint2),

        new PublicKey(inputFormat.configId),

        new BN(inputFormat.mintAAmount),
        new BN(inputFormat.mintBAmount),

        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Create raydium cpmm pool successfully",
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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.tokenA === "string" &&
        typeof parsedInput.amountA === "number" &&
        typeof parsedInput.tokenB === "string" &&
        typeof parsedInput.amountB === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaOpenbookCreateMarket extends Tool implements Action {
  name = "solana_openbook_create_market";
  similes = ["create_market", "openbook_create_market"];
  description = `Openbook marketId, required for ammv4

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  lotSize: number (required)
  tickSize: number (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                baseToken: "So11111111111111111111111111111111111111112",
                quoteToken: "So22222222222222222222222222222222222222222",
                baseLotSize: 100,
                quoteLotSize: 200,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { marketAddress: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.openbookCreateMarket(
        new PublicKey(inputFormat.baseMint),
        new PublicKey(inputFormat.quoteMint),

        inputFormat.lotSize,
        inputFormat.tickSize,
      );

      return JSON.stringify({
        status: "success",
        message: "Create openbook market successfully",
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
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.baseToken === "string" &&
        typeof parsedInput.quoteToken === "string" &&
        typeof parsedInput.baseLotSize === "number" &&
        typeof parsedInput.quoteLotSize === "number"
      );
    } catch {
      return false;
    }
  };
}

export class SolanaPythFetchPrice extends Tool implements Action {
  name = "solana_pyth_fetch_price";
  similes = ["fetch_price", "pyth_fetch_price"];
  description = `Fetch the price of a given price feed from Pyth's Hermes service

  Inputs:
  priceFeedID: string, the price feed ID, e.g., "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43" for BTC/USD`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenSymbol: "SOL",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { price: 150.25 },
        },
      },
    ],
  ];
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const price = await this.solanaKit.pythFetchPrice(input);
      const response: PythFetchPriceResponse = {
        status: "success",
        priceFeedID: input,
        price: price,
      };
      return JSON.stringify(response);
    } catch (error: any) {
      const response: PythFetchPriceResponse = {
        status: "error",
        priceFeedID: input,
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
      return JSON.stringify(response);
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.tokenSymbol === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaResolveAllDomainsTool extends Tool implements Action {
  name = "solana_resolve_all_domains";
  similes = ["resolve_all_domains", "get_all_domains"];
  description = `Resolve domain names to a public key for ALL domain types EXCEPT .sol domains.
  Use this for domains like .blink, .bonk, etc.
  DO NOT use this for .sol domains (use solana_resolve_domain instead).

  Input:
  domain: string, eg "mydomain.blink" or "mydomain.bonk" (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                address: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { domains: ["example1.sol", "example2.sol"] },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const owner = await this.solanaKit.resolveAllDomains(input);

      if (!owner) {
        return JSON.stringify({
          status: "error",
          message: "Domain not found",
          code: "DOMAIN_NOT_FOUND",
        });
      }

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        owner: owner?.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DOMAIN_RESOLUTION_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.address === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaGetOwnedDomains extends Tool implements Action {
  name = "solana_get_owned_domains";
  similes = ["get_owned_domains", "fetch_owned_domains"];
  description = `Get all domains owned by a specific wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                address: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { domains: ["example1.sol", "example2.sol"] },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const domains = await this.solanaKit.getOwnedAllDomains(ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Owned domains fetched successfully",
        domains: domains,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_OWNED_DOMAINS_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.address === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaGetOwnedTldDomains extends Tool implements Action {
  name = "solana_get_owned_tld_domains";
  similes = ["get_owned_tld_domains", "fetch_owned_tld_domains"];
  description = `Get all domains owned by the agent's wallet for a specific TLD.

  Inputs:
  tld: string, eg "bonk" (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                address: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tldDomains: ["example1.sol", "example2.sol"] },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const domains = await this.solanaKit.getOwnedDomainsForTLD(input);

      return JSON.stringify({
        status: "success",
        message: "TLD domains fetched successfully",
        domains: domains,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLD_DOMAINS_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.address === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaGetAllTlds extends Tool implements Action {
  name = "solana_get_all_tlds";
  similes = ["get_all_tlds", "fetch_all_tlds"];
  description = `Get all active top-level domains (TLDs) in the AllDomains Name Service`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: "",
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tlds: ["example1.sol", "example2.sol"] },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const tlds = await this.solanaKit.getAllDomainsTLDs();

      return JSON.stringify({
        status: "success",
        message: "TLDs fetched successfully",
        tlds: tlds,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLDS_ERROR",
      });
    }
  }
  handler: Handler = async () => {
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call();
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async () => {
    return true;
  };
}

export class SolanaGetMainDomain extends Tool implements Action {
  name = "solana_get_main_domain";
  similes = ["get_main_domain", "fetch_main_domain"];
  description = `Get the main/favorite domain for a given wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                address: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { mainDomain: "example.sol" },
        },
      },
    ],
  ];

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const mainDomain =
        await this.solanaKit.getMainAllDomainsDomain(ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Main domain fetched successfully",
        domain: mainDomain,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_MAIN_DOMAIN_ERROR",
      });
    }
  }
  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return typeof parsedInput.address === "string";
    } catch {
      return false;
    }
  };
}

export class SolanaCreateGibworkTask extends Tool implements Action {
  name = "create_gibwork_task";
  similes = ["create_gibwork_task", "create_task"];
  description = `Create a task on Gibwork.

  Inputs (input is a JSON string):
  title: string, title of the task (required)
  content: string, description of the task (required)
  requirements: string, requirements to complete the task (required)
  tags: string[], list of tags associated with the task (required)
  payer: string, payer address (optional, defaults to agent wallet)
  tokenMintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, payment amount (required)
  `;
  examples: ActionExample[][] = [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                title: "Task Title",
                description: "Task Description",
                reward: 100,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { taskId: "5G9f8..." },
        },
      },
    ],
  ];

  constructor(private solanaSdk: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const taskData = await this.solanaSdk.createGibworkTask(
        parsedInput.title,
        parsedInput.content,
        parsedInput.requirements,
        parsedInput.tags,
        parsedInput.tokenMintAddress,
        parsedInput.amount,
        parsedInput.payer,
      );

      const response: GibworkCreateTaskReponse = {
        status: "success",
        taskId: taskData.taskId,
        signature: taskData.signature,
      };

      return JSON.stringify(response);
    } catch (err: any) {
      return JSON.stringify({
        status: "error",
        message: err.message,
        code: err.code || "CREATE_TASK_ERROR",
      });
    }
  }

  handler: Handler = async (context, ...args) => {
    const input = args[0];
    const convert = async (): Promise<ActionResult> => {
      const promise_string = await this._call(input);
      return JSON.parse(promise_string);
    };
    return convert();
  };

  validate: Validator = async (context, ...args) => {
    const input = args[0];
    try {
      const parsedInput = JSON.parse(input);
      return (
        typeof parsedInput.title === "string" &&
        typeof parsedInput.description === "string" &&
        typeof parsedInput.reward === "number"
      );
    } catch {
      return false;
    }
  };
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
    new SolanaLendAssetTool(solanaKit),
    new SolanaTPSCalculatorTool(solanaKit),
    new SolanaStakeTool(solanaKit),
    new SolanaFetchPriceTool(solanaKit),
    new SolanaGetDomainTool(solanaKit),
    new SolanaTokenDataTool(solanaKit),
    new SolanaTokenDataByTickerTool(solanaKit),
    new SolanaCompressedAirdropTool(solanaKit),
    new SolanaRaydiumCreateAmmV4(solanaKit),
    new SolanaRaydiumCreateClmm(solanaKit),
    new SolanaRaydiumCreateCpmm(solanaKit),
    new SolanaOpenbookCreateMarket(solanaKit),
    new SolanaCreateSingleSidedWhirlpoolTool(solanaKit),
    new SolanaPythFetchPrice(solanaKit),
    new SolanaResolveDomainTool(solanaKit),
    new SolanaGetOwnedDomains(solanaKit),
    new SolanaGetOwnedTldDomains(solanaKit),
    new SolanaGetAllTlds(solanaKit),
    new SolanaGetMainDomain(solanaKit),
    new SolanaResolveAllDomainsTool(solanaKit),
    new SolanaCreateGibworkTask(solanaKit),
  ];
}
