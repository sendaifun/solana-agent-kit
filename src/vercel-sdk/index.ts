import { tool, type CoreTool } from "ai";
import { SolanaAgentKit } from "../agent";
import z from "zod";
import { PublicKey } from "@solana/web3.js";
import { create_image } from "../tools/create_image";
import BN from "bn.js";
import Decimal from "decimal.js";
import { FEE_TIERS } from "../tools";
import { GibworkCreateTaskReponse, PythFetchPriceResponse } from "../types";

export class VercelAITools {
  constructor(private solanaKit: SolanaAgentKit) {}

  solanaBalanceTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.balance",
      description: `Get the balance of a Solana wallet or token account.

      If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
      If no tokenAddress is provided, the balance will be in SOL.

      Inputs:
      tokenAccountAddress: string, eg "So11111111111111111111111111111111111111112" (optional)`,
      parameters: z.object({
        tokenAccountAddress: z.string().optional(),
      }),
      execute: async ({ tokenAccountAddress }) => {
        try {
          const address = tokenAccountAddress
            ? new PublicKey(tokenAccountAddress)
            : undefined;
          const balance = await this.solanaKit.getBalance(address);

          return {
            status: "success",
            balance: balance,
            token: address ? address.toBase58() : "SOL",
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaTransferTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.transfer",
      description: `
			Transfer tokens or SOL to another address ( also called as wallet address ).

      Inputs ( input is a JSON string ):
      to: string, eg "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk" (required)
      amount: number, eg 1 (required)
      mint?: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)      `,
      parameters: z.object({
        to: z.string(),
        amount: z.number(),
        mint: z.string().optional(),
      }),
      execute: async ({ to, amount, mint }) => {
        try {
          const recipient = new PublicKey(to);
          const mintAddress = mint ? new PublicKey(mint) : undefined;

          const tx = await this.solanaKit.transfer(
            recipient,
            amount,
            mintAddress,
          );

          return {
            status: "success",
            message: "Transfer completed successfully",
            amount: amount,
            recipient: to,
            token: mint || "SOL",
            transaction: tx,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaDeployTokenTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.deployToken",
      description: `Deploy a new token on Solana blockchain.

      Inputs (input is a JSON string):
      name: string, eg "My Token" (required)
      uri: string, eg "https://example.com/token.json" (required)
      symbol: string, eg "MTK" (required)
      decimals?: number, eg 9 (optional, defaults to 9)
      initialSupply?: number, eg 1000000 (optional)`,
      parameters: z.object({
        name: z.string(),
        uri: z.string(),
        symbol: z.string(),
        decimals: z.number().optional(),
        initialSupply: z.number().optional(),
      }),
      execute: async ({
        name,
        uri,
        symbol,
        decimals = 9,
        initialSupply = 0,
      }) => {
        try {
          const result = await this.solanaKit.deployToken(
            name,
            uri,
            symbol,
            decimals,
            initialSupply,
          );

          return {
            status: "success",
            message: "Token deployed successfully",
            mintAddress: result.mint.toString(),
            decimals: decimals || 9,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaDeployCollectionTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.deployCollection",
      description: "Deploy a new NFT collection on Solana blockchain",
      parameters: z.object({
        name: z.string(),
        uri: z.string(),
        royaltyBasisPoints: z.number().optional(),
      }),
      execute: async ({ name, uri, royaltyBasisPoints = 0 }) => {
        try {
          const result = await this.solanaKit.deployCollection({
            name,
            uri,
            royaltyBasisPoints,
          });
          return {
            status: "success",
            message: "Collection deployed successfully",
            collectionAddress: result.collectionAddress.toString(),
            name,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaMintNFTTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.mintNFT",
      description: "Mint a new NFT in a collection on Solana blockchain",
      parameters: z.object({
        collectionMint: z.string(),
        name: z.string(),
        uri: z.string(),
        recipient: z.string().optional(),
      }),
      execute: async ({ collectionMint, name, uri, recipient }) => {
        try {
          const result = await this.solanaKit.mintNFT(
            new PublicKey(collectionMint),
            { name, uri },
            recipient
              ? new PublicKey(recipient)
              : this.solanaKit.wallet_address,
          );
          return {
            status: "success",
            message: "NFT minted successfully",
            mintAddress: result.mint.toString(),
            metadata: { name, uri },
            recipient: recipient || result.mint.toString(),
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaTradeTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.trade",
      description: "Swap tokens using Jupiter Exchange",
      parameters: z.object({
        outputMint: z.string(),
        inputAmount: z.number(),
        inputMint: z.string().optional(),
        slippageBps: z.number().optional(),
      }),
      execute: async ({ outputMint, inputAmount, inputMint, slippageBps }) => {
        try {
          const tx = await this.solanaKit.trade(
            new PublicKey(outputMint),
            inputAmount,
            inputMint
              ? new PublicKey(inputMint)
              : new PublicKey("So11111111111111111111111111111111111111112"),
            slippageBps,
          );
          return {
            status: "success",
            message: "Trade executed successfully",
            transaction: tx,
            inputAmount,
            inputToken: inputMint || "SOL",
            outputToken: outputMint,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaRequestFundsTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.requestFunds",
      description: "Request SOL from Solana faucet (devnet/testnet only)",
      parameters: z.object({}),
      execute: async () => {
        try {
          await this.solanaKit.requestFaucetFunds();
          return {
            status: "success",
            message: "Successfully requested faucet funds",
            network: this.solanaKit.connection.rpcEndpoint.split("/")[2],
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaRegisterDomainTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.registerDomain",
      description: "Register a .sol domain name for your wallet",
      parameters: z.object({
        name: z.string().min(1, "Name is required"),
        spaceKB: z
          .number()
          .positive("spaceKB must be a positive number")
          .default(1)
          .optional(),
      }),
      execute: async ({ name, spaceKB = 1 }) => {
        try {
          const tx = await this.solanaKit.registerDomain(name, spaceKB);
          return {
            status: "success",
            message: "Domain registered successfully",
            transaction: tx,
            domain: `${name}.sol`,
            spaceKB,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaResolveDomainTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.resolveDomain",
      description: `Resolve ONLY .sol domain names to a Solana PublicKey.
        This tool is exclusively for .sol domains.
        DO NOT use this for other domain types like .blink, .bonk, etc.`,
      parameters: z.object({
        domain: z
          .string()
          .trim()
          .min(1, "Domain name is required")
          .regex(/\.sol$/, "Domain must end with .sol"),
      }),
      execute: async ({ domain }) => {
        try {
          const publicKey = await this.solanaKit.resolveSolDomain(domain);
          return {
            status: "success",
            message: "Domain resolved successfully",
            publicKey: publicKey.toBase58(),
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaGetDomainTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getDomain",
      description:
        "Retrieve the .sol domain associated with a given account address",
      parameters: z.object({
        account: z
          .string()
          .trim()
          .min(1, "Account address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid Solana account address"),
      }),
      execute: async ({ account }) => {
        try {
          const publicKey = new PublicKey(account);
          const domain = await this.solanaKit.getPrimaryDomain(publicKey);
          return {
            status: "success",
            message: "Primary domain retrieved successfully",
            domain,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaGetWalletAddressTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getWalletAddress",
      description: "Get the wallet address of the agent",
      parameters: z.object({}),
      execute: async () => {
        return {
          status: "success",
          message: "Wallet address retrieved successfully",
          address: this.solanaKit.wallet_address.toString(),
        };
      },
    });
  }

  solanaPumpfunTokenLaunchTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.launchPumpfunToken",
      description: `Launch a token on Pump.fun.
        Do not use this tool for any other purpose, or for creating SPL tokens.
        If the user asks you to choose the parameters, you should generate valid values.
        For generating the image, you can use the solana_create_image tool.`,
      parameters: z.object({
        tokenName: z.string().min(1, "Token name is required"),
        tokenTicker: z.string().min(1, "Token ticker is required"),
        description: z.string().min(1, "Description is required"),
        imageUrl: z.string().url("Invalid image URL"),
        twitter: z.string().url("Invalid Twitter URL").optional(),
        telegram: z.string().url("Invalid Telegram URL").optional(),
        website: z.string().url("Invalid website URL").optional(),
        initialLiquiditySOL: z
          .number()
          .positive("Initial liquidity must be positive")
          .optional(),
      }),
      execute: async ({
        tokenName,
        tokenTicker,
        description,
        imageUrl,
        twitter,
        telegram,
        website,
        initialLiquiditySOL,
      }) => {
        try {
          await this.solanaKit.launchPumpFunToken(
            tokenName,
            tokenTicker,
            description,
            imageUrl,
            // @ts-expect-error Value matches type however TS still shows error
            {
              twitter,
              telegram,
              website,
              initialLiquiditySOL,
            },
          );

          return {
            status: "success",
            message: "Token launched successfully on Pump.fun",
            tokenName,
            tokenTicker,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaCreateImageTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.createImage",
      description:
        "Create an image using OpenAI's DALL-E. Input should be a string prompt for the image.",
      parameters: z.object({
        prompt: z.string().trim().min(1, "Image prompt cannot be empty"),
      }),
      execute: async ({ prompt }) => {
        try {
          const result = await create_image(this.solanaKit, prompt);
          return {
            status: "success",
            message: "Image created successfully",
            ...result,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaLendAssetTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.lendAsset",
      description:
        "Lend idle USDC for yield using Lulo (only USDC is supported)",
      parameters: z.object({
        amount: z
          .number()
          .positive("Amount must be positive")
          .min(0.000001, "Amount must be at least 0.000001 USDC"),
      }),
      execute: async ({ amount }) => {
        try {
          const tx = await this.solanaKit.lendAssets(amount);
          return {
            status: "success",
            message: "Asset lent successfully",
            transaction: tx,
            amount,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaTPSCalculatorTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getTPS",
      description:
        "Get the current TPS (transactions per second) of the Solana network",
      parameters: z.object({}),
      execute: async () => {
        try {
          const tps = await this.solanaKit.getTPS();
          return {
            status: "success",
            message: "TPS fetched successfully",
            network: "mainnet-beta",
            tps: tps,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaStakeTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.stake",
      description:
        "Stake your SOL (Solana), also called as SOL staking or liquid staking",
      parameters: z.object({
        amount: z
          .number()
          .positive("Stake amount must be positive")
          .min(0.001, "Minimum stake amount is 0.001 SOL"),
      }),
      execute: async ({ amount }) => {
        try {
          const tx = await this.solanaKit.stake(amount);
          return {
            status: "success",
            message: "Staked successfully",
            transaction: tx,
            amount,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaFetchPriceTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.fetchPrice",
      description: "Fetch the price of a given token in USDC",
      parameters: z.object({
        tokenId: z
          .string()
          .trim()
          .min(1, "Token ID is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid Solana token address"),
      }),
      execute: async ({ tokenId }) => {
        try {
          const price = await this.solanaKit.fetchTokenPrice(tokenId);
          return {
            status: "success",
            tokenId,
            priceInUSDC: price,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaTokenDataTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.tokenData",
      description: "Get the token data for a given token mint address",
      parameters: z.object({
        mintAddress: z
          .string()
          .trim()
          .min(1, "Mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid Solana token address"),
      }),
      execute: async ({ mintAddress }) => {
        try {
          const tokenData =
            await this.solanaKit.getTokenDataByAddress(mintAddress);
          return {
            status: "success",
            tokenData,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaTokenDataByTickerTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.tokenDataByTicker",
      description: "Get the token data for a given token ticker",
      parameters: z.object({
        ticker: z
          .string()
          .trim()
          .min(1, "Ticker is required")
          .max(10, "Ticker too long"),
      }),
      execute: async ({ ticker }) => {
        try {
          const tokenData = await this.solanaKit.getTokenDataByTicker(ticker);
          return {
            status: "success",
            tokenData,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaCompressedAirdropTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.compressedAirdrop",
      description: "Airdrop SPL tokens with ZK Compression",
      parameters: z.object({
        mintAddress: z
          .string()
          .trim()
          .min(1, "Mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid token mint address"),
        amount: z.number().positive("Amount must be positive"),
        decimals: z
          .number()
          .int("Decimals must be an integer")
          .min(0, "Decimals must be non-negative")
          .max(9, "Decimals cannot exceed 9"),
        recipients: z
          .array(z.string())
          .min(1, "At least one recipient is required")
          .refine(
            (recipients) =>
              recipients.every((addr) => {
                try {
                  new PublicKey(addr);
                  return true;
                } catch {
                  return false;
                }
              }),
            "One or more recipient addresses are invalid",
          ),
        priorityFeeInLamports: z
          .number()
          .int("Priority fee must be an integer")
          .nonnegative("Priority fee cannot be negative")
          .default(30_000),
        shouldLog: z.boolean().default(false),
      }),
      execute: async ({
        mintAddress,
        amount,
        decimals,
        recipients,
        priorityFeeInLamports,
        shouldLog,
      }) => {
        try {
          const txs = await this.solanaKit.sendCompressedAirdrop(
            mintAddress,
            amount,
            decimals,
            recipients,
            priorityFeeInLamports,
            shouldLog,
          );
          return {
            status: "success",
            message: `Airdropped ${amount} tokens to ${recipients.length} recipients.`,
            transactionHashes: txs,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaCreateSingleSidedWhirlpoolTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.createOrcaSingleSidedWhirlpool",
      description: "Create a single-sided Whirlpool with liquidity",
      parameters: z.object({
        depositTokenAmount: z
          .number()
          .int("Deposit amount must be an integer")
          .positive("Deposit amount must be positive"),
        depositTokenMint: z
          .string()
          .trim()
          .min(1, "Deposit token mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid deposit token mint address"),
        otherTokenMint: z
          .string()
          .trim()
          .min(1, "Other token mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid other token mint address"),
        initialPrice: z.number().positive("Initial price must be positive"),
        maxPrice: z
          .number()
          .positive("Max price must be positive")
          .refine((val) => val > 0, "Max price must be greater than 0"),
        feeTier: z
          .number()
          .refine(
            (val) => val in FEE_TIERS,
            `Invalid fee tier. Available options: ${Object.keys(FEE_TIERS).join(", ")}`,
          ),
      }),
      execute: async ({
        depositTokenAmount,
        depositTokenMint,
        otherTokenMint,
        initialPrice,
        maxPrice,
        feeTier,
      }) => {
        try {
          const txId = await this.solanaKit.createOrcaSingleSidedWhirlpool(
            new BN(depositTokenAmount),
            new PublicKey(depositTokenMint),
            new PublicKey(otherTokenMint),
            new Decimal(initialPrice),
            new Decimal(maxPrice),
            // @ts-expect-error Value matches type however TS still shows error
            feeTier,
          );

          return {
            status: "success",
            message: "Single-sided Whirlpool created successfully",
            transaction: txId,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaRaydiumCreateAmmV4Tool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.raydiumCreateAmmV4",
      description:
        "Create Raydium's Legacy AMM that requires an OpenBook marketID",
      parameters: z.object({
        marketId: z
          .string()
          .trim()
          .min(1, "Market ID is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid market ID"),
        baseAmount: z
          .number()
          .int("Base amount must be an integer")
          .positive("Base amount must be positive"),
        quoteAmount: z
          .number()
          .int("Quote amount must be an integer")
          .positive("Quote amount must be positive"),
        startTime: z
          .number()
          .int("Start time must be an integer")
          .nonnegative("Start time cannot be negative"),
      }),
      execute: async ({ marketId, baseAmount, quoteAmount, startTime }) => {
        try {
          const tx = await this.solanaKit.raydiumCreateAmmV4(
            new PublicKey(marketId),
            new BN(baseAmount),
            new BN(quoteAmount),
            new BN(startTime),
          );

          return {
            status: "success",
            message: "Raydium AMM V4 pool created successfully",
            transaction: tx,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaRaydiumCreateClmmTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.raydiumCreateClmm",
      description:
        "Create a Concentrated Liquidity Market Maker (CLMM) pool with custom liquidity ranges",
      parameters: z.object({
        mint1: z
          .string()
          .trim()
          .min(1, "First mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid first mint address"),
        mint2: z
          .string()
          .trim()
          .min(1, "Second mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid second mint address"),
        configId: z
          .string()
          .trim()
          .min(1, "Config ID is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid config ID"),
        initialPrice: z.number().positive("Initial price must be positive"),
        startTime: z
          .number()
          .int("Start time must be an integer")
          .nonnegative("Start time cannot be negative"),
      }),
      execute: async ({ mint1, mint2, configId, initialPrice, startTime }) => {
        try {
          const tx = await this.solanaKit.raydiumCreateClmm(
            new PublicKey(mint1),
            new PublicKey(mint2),
            new PublicKey(configId),
            new Decimal(initialPrice),
            new BN(startTime),
          );

          return {
            status: "success",
            message: "Raydium CLMM pool created successfully",
            transaction: tx,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaRaydiumCreateCpmmTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.raydiumCreateCpmm",
      description:
        "Create Raydium's newest CPMM pool (supports Token 2022 standard)",
      parameters: z.object({
        mint1: z
          .string()
          .trim()
          .min(1, "First mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid first mint address"),
        mint2: z
          .string()
          .trim()
          .min(1, "Second mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid second mint address"),
        configId: z
          .string()
          .trim()
          .min(1, "Config ID is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid config ID"),
        mintAAmount: z
          .number()
          .int("Mint A amount must be an integer")
          .positive("Mint A amount must be positive"),
        mintBAmount: z
          .number()
          .int("Mint B amount must be an integer")
          .positive("Mint B amount must be positive"),
        startTime: z
          .number()
          .int("Start time must be an integer")
          .nonnegative("Start time cannot be negative"),
      }),
      execute: async ({
        mint1,
        mint2,
        configId,
        mintAAmount,
        mintBAmount,
        startTime,
      }) => {
        try {
          const tx = await this.solanaKit.raydiumCreateCpmm(
            new PublicKey(mint1),
            new PublicKey(mint2),
            new PublicKey(configId),
            new BN(mintAAmount),
            new BN(mintBAmount),
            new BN(startTime),
          );

          return {
            status: "success",
            message: "Raydium CPMM pool created successfully",
            transaction: tx,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaOpenbookCreateMarketTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.openbookCreateMarket",
      description: "Create an Openbook market (required for AMM v4)",
      parameters: z.object({
        baseMint: z
          .string()
          .trim()
          .min(1, "Base mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid base mint address"),
        quoteMint: z
          .string()
          .trim()
          .min(1, "Quote mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid quote mint address"),
        lotSize: z.number().positive("Lot size must be positive"),
        tickSize: z.number().positive("Tick size must be positive"),
      }),
      execute: async ({ baseMint, quoteMint, lotSize, tickSize }) => {
        try {
          const tx = await this.solanaKit.openbookCreateMarket(
            new PublicKey(baseMint),
            new PublicKey(quoteMint),
            lotSize,
            tickSize,
          );

          return {
            status: "success",
            message: "Openbook market created successfully",
            transaction: tx,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          };
        }
      },
    });
  }

  solanaPythFetchPriceTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.pythFetchPrice",
      description:
        "Fetch the price of a given price feed from Pyth's Hermes service",
      parameters: z.object({
        priceFeedID: z
          .string()
          .trim()
          .min(1, "Price feed ID is required")
          .regex(
            /^0x[a-fA-F0-9]{64}$/,
            "Invalid price feed ID format. Must be a 32-byte hex string starting with 0x",
          ),
      }),
      execute: async ({ priceFeedID }) => {
        try {
          const price = await this.solanaKit.pythFetchPrice(priceFeedID);
          return {
            status: "success",
            priceFeedID,
            price,
          } as PythFetchPriceResponse;
        } catch (e: any) {
          return {
            status: "error",
            priceFeedID,
            message: e.message,
            code: e.code || "UNKNOWN_ERROR",
          } as PythFetchPriceResponse;
        }
      },
    });
  }

  solanaResolveAllDomainsTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.resolveAllDomains",
      description: `Resolve domain names to a public key for ALL domain types EXCEPT .sol domains.
        Use this for domains like .blink, .bonk, etc.
        DO NOT use this for .sol domains.`,
      parameters: z.object({
        domain: z
          .string()
          .trim()
          .min(1, "Domain name is required")
          .refine(
            (val) => !val.endsWith(".sol"),
            "This tool cannot be used for .sol domains. Use solana.resolveDomain instead.",
          )
          .refine(
            (val) => val.includes("."),
            "Invalid domain format. Must include a TLD (e.g., .blink, .bonk)",
          ),
      }),
      execute: async ({ domain }) => {
        try {
          const owner = await this.solanaKit.resolveAllDomains(domain);

          if (!owner) {
            return {
              status: "error",
              message: "Domain not found",
              code: "DOMAIN_NOT_FOUND",
            };
          }

          return {
            status: "success",
            message: "Domain resolved successfully",
            owner: owner.toString(),
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "DOMAIN_RESOLUTION_ERROR",
          };
        }
      },
    });
  }

  solanaGetOwnedDomainsTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getOwnedDomains",
      description: "Get all domains owned by a specific wallet address",
      parameters: z.object({
        owner: z
          .string()
          .trim()
          .min(1, "Owner address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid Solana wallet address"),
      }),
      execute: async ({ owner }) => {
        try {
          const ownerPubkey = new PublicKey(owner);
          const domains = await this.solanaKit.getOwnedAllDomains(ownerPubkey);
          return {
            status: "success",
            message: "Owned domains fetched successfully",
            domains,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "FETCH_OWNED_DOMAINS_ERROR",
          };
        }
      },
    });
  }

  solanaGetOwnedTldDomainsTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getOwnedTldDomains",
      description:
        "Get all domains owned by the agent's wallet for a specific TLD",
      parameters: z.object({
        tld: z
          .string()
          .trim()
          .min(1, "TLD is required")
          .regex(
            /^[a-zA-Z0-9]+$/,
            "TLD must contain only alphanumeric characters",
          ),
      }),
      execute: async ({ tld }) => {
        try {
          const domains = await this.solanaKit.getOwnedDomainsForTLD(tld);
          return {
            status: "success",
            message: "TLD domains fetched successfully",
            domains,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "FETCH_TLD_DOMAINS_ERROR",
          };
        }
      },
    });
  }

  solanaGetAllTldsTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getAllTlds",
      description:
        "Get all active top-level domains (TLDs) in the AllDomains Name Service",
      parameters: z.object({}),
      execute: async () => {
        try {
          const tlds = await this.solanaKit.getAllDomainsTLDs();
          return {
            status: "success",
            message: "TLDs fetched successfully",
            tlds,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "FETCH_TLDS_ERROR",
          };
        }
      },
    });
  }

  solanaGetMainDomainTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.getMainDomain",
      description: "Get the main/favorite domain for a given wallet address",
      parameters: z.object({
        owner: z
          .string()
          .trim()
          .min(1, "Owner address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid Solana wallet address"),
      }),
      execute: async ({ owner }) => {
        try {
          const ownerPubkey = new PublicKey(owner);
          const mainDomain =
            await this.solanaKit.getMainAllDomainsDomain(ownerPubkey);
          return {
            status: "success",
            message: "Main domain fetched successfully",
            domain: mainDomain,
          };
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "FETCH_MAIN_DOMAIN_ERROR",
          };
        }
      },
    });
  }

  solanaCreateGibworkTaskTool(): CoreTool {
    return tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: "solana.createGibworkTask",
      description: "Create a task on Gibwork",
      parameters: z.object({
        title: z
          .string()
          .trim()
          .min(1, "Title is required")
          .max(200, "Title too long"),
        content: z.string().trim().min(1, "Description is required"),
        requirements: z.string().trim().min(1, "Requirements are required"),
        tags: z
          .array(z.string())
          .min(1, "At least one tag is required")
          .max(10, "Maximum 10 tags allowed"),
        payer: z
          .string()
          .trim()
          .optional()
          .refine((val) => {
            if (!val) {
              return true;
            }
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid payer wallet address"),
        tokenMintAddress: z
          .string()
          .trim()
          .min(1, "Token mint address is required")
          .refine((val) => {
            try {
              new PublicKey(val);
              return true;
            } catch {
              return false;
            }
          }, "Invalid token mint address"),
        amount: z
          .number()
          .positive("Amount must be positive")
          .min(0.000001, "Amount must be at least 0.000001"),
      }),
      execute: async ({
        title,
        content,
        requirements,
        tags,
        tokenMintAddress,
        amount,
        payer,
      }) => {
        try {
          const taskData = await this.solanaKit.createGibworkTask(
            title,
            content,
            requirements,
            tags,
            tokenMintAddress,
            amount,
            payer,
          );

          return {
            status: "success",
            taskId: taskData.taskId,
            signature: taskData.signature,
          } as GibworkCreateTaskReponse;
        } catch (e: any) {
          return {
            status: "error",
            message: e.message,
            code: e.code || "CREATE_TASK_ERROR",
          };
        }
      },
    });
  }
}

export function createSolanaTools(
  solanaKit: SolanaAgentKit,
): Record<string, CoreTool> {
  const vercelTools = new VercelAITools(solanaKit);

  return {
    solanaBalanceTool: vercelTools.solanaBalanceTool(),
    solanaTransferTool: vercelTools.solanaTransferTool(),
    solanaDeployTokenTool: vercelTools.solanaDeployTokenTool(),
    solanaDeployCollectionTool: vercelTools.solanaDeployCollectionTool(),
    solanaMintNFTTool: vercelTools.solanaMintNFTTool(),
    solanaTradeTool: vercelTools.solanaTradeTool(),
    solanaRequestFundsTool: vercelTools.solanaRequestFundsTool(),
    solanaRegisterDomainTool: vercelTools.solanaRegisterDomainTool(),
    solanaGetWalletAddressTool: vercelTools.solanaGetWalletAddressTool(),
    solanaPumpfunTokenLaunchTool: vercelTools.solanaPumpfunTokenLaunchTool(),
    solanaCreateImageTool: vercelTools.solanaCreateImageTool(),
    solanaLendAssetTool: vercelTools.solanaLendAssetTool(),
    solanaTPSCalculatorTool: vercelTools.solanaTPSCalculatorTool(),
    solanaStakeTool: vercelTools.solanaStakeTool(),
    solanaFetchPriceTool: vercelTools.solanaFetchPriceTool(),
    solanaTokenDataTool: vercelTools.solanaTokenDataTool(),
    solanaTokenDataByTickerTool: vercelTools.solanaTokenDataByTickerTool(),
    solanaCompressedAirdropTool: vercelTools.solanaCompressedAirdropTool(),
    solanaRaydiumCreateAmmV4Tool: vercelTools.solanaRaydiumCreateAmmV4Tool(),
    solanaRaydiumCreateClmmTool: vercelTools.solanaRaydiumCreateClmmTool(),
    solanaRaydiumCreateCpmmTool: vercelTools.solanaRaydiumCreateCpmmTool(),
    solanaOpenbookCreateMarketTool:
      vercelTools.solanaOpenbookCreateMarketTool(),
    solanaCreateSingleSidedWhirlpoolTool:
      vercelTools.solanaCreateSingleSidedWhirlpoolTool(),
    solanaPythFetchPriceTool: vercelTools.solanaPythFetchPriceTool(),
    solanaResolveDomainTool: vercelTools.solanaResolveDomainTool(),
    solanaResolveAllDomainsTool: vercelTools.solanaResolveAllDomainsTool(),
    solanaGetDomainTool: vercelTools.solanaGetDomainTool(),
    solanaGetOwnedDomainsTool: vercelTools.solanaGetOwnedDomainsTool(),
    solanaGetOwnedTldDomainsTool: vercelTools.solanaGetOwnedTldDomainsTool(),
    solanaGetAllTldsTool: vercelTools.solanaGetAllTldsTool(),
    solanaGetMainDomainTool: vercelTools.solanaGetMainDomainTool(),
    solanaCreateGibworkTaskTool: vercelTools.solanaCreateGibworkTaskTool(),
  };
}