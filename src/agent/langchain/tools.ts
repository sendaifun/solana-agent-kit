import { PublicKey } from "@solana/web3.js";
import { StructuredTool } from "langchain/tools";
import { SolanaAgentKit } from "../index";
import { create_image } from "../../tools/create_image";
import { z } from "zod";
import {
  FnBalance,
  FnCompressedAirdrop,
  FnCreateGibworkTask,
  FnCreateImageTool,
  FnCreateSingleSidedWhirlpool,
  FnDeployCollection,
  FnDeployToken,
  FnFetchPrice,
  FnGetAllTlds,
  FnGetDomainList,
  FnGetMainDomain,
  FnGetOwnedDomains,
  FnGetOwnedTldDomains,
  FnGetWalletAddress,
  FnLendAssetTool,
  FnMintNFT,
  FnOpenbookCreateMarket,
  FnPumpFunTokenLaunch,
  FnPythFetchPrice,
  FnRaydiumCreateAmmV4,
  FnRaydiumCreateClmm,
  FnRaydiumCreateCpmm,
  FnRegisterDomain,
  FnRequestFunds,
  FnResolveAllDomains,
  FnResolveDomain,
  FnRockPaperScissors,
  FnStakeTool,
  FnTipLink,
  FnTokenData,
  FnTokenDataByTicker,
  FnTPSCalculatorTool,
  FnTrade,
  FnTransaction,
} from "../../constants/tools";
import {
  ZBalance,
  ZDeployToken,
  ZTransaction,
  ZDeployCollection,
  ZMintNFT,
  ZTrade,
  ZRequestFunds,
  ZRegisterDomain,
  ZResolveDomain,
  ZGetDomainList,
  ZGetWalletAddress,
  ZPumpFunTokenLaunch,
  ZCreateImageTool,
  ZLendAssetTool,
  ZTPSCalculatorTool,
  ZStakeTool,
  ZTokenData,
  ZFetchPrice,
  ZTokenDataByTicker,
  ZCompressedAirdrop,
  ZCreateSingleSidedWhirlpool,
  ZRaydiumCreateAmmV4,
  ZRaydiumCreateClmm,
  ZRaydiumCreateCpmm,
  ZOpenbookCreateMarket,
  ZPythFetchPrice,
  ZResolveAllDomains,
  ZGetOwnedDomains,
  ZGetOwnedTldDomains,
  ZGetAllTlds,
  ZGetMainDomain,
  ZCreateGibworkTask,
  ZTipLink,
  ZRockPaperScissors,
} from "../../types/tools";
import BN from "bn.js";
import Decimal from "decimal.js";
import { FEE_TIERS } from "../../tools";

type ZodObjectAny = z.ZodObject<any, any, any, any>;

export class BalanceTool extends StructuredTool<ZodObjectAny> {
  name = "balance";
  description = FnBalance;
  schema = ZBalance.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<any> {
    try {
      const tokenAddress = input.tokenAddress
        ? new PublicKey(input.tokenAddress)
        : undefined;
      const balance = await this.kit.getBalance(tokenAddress);
      return {
        status: "success",
        balance: balance,
        token: input || "SOL",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  }
}

export class TransferTool extends StructuredTool<ZodObjectAny> {
  name = "transfer";
  description = FnTransaction;
  schema = ZTransaction.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const recipient = new PublicKey(input.to);
      const mintAddress = input.mint ? new PublicKey(input.mint) : undefined;

      const tx = await this.kit.transfer(recipient, input.amount, mintAddress);

      return JSON.stringify({
        status: "success",
        message: "Transfer completed successfully",
        payload: {
          amount: input.amount,
          recipient: input.to,
          token: input.mint || "SOL",
          transaction: tx,
        },
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

export class DeployTokenTool extends StructuredTool<ZodObjectAny> {
  name = "deploy_token";
  description = FnDeployToken;
  schema = ZDeployToken.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const result = await this.kit.deployToken(
        input.name,
        input.uri,
        input.symbol,
        input.decimals,
        input.initialSupply,
      );

      return JSON.stringify({
        status: "success",
        message: "Token deployed successfully",
        mintAddress: result.mint.toString(),
        decimals: input.decimals,
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

export class DeployCollectionTool extends StructuredTool<ZodObjectAny> {
  name = "deploy_collection";
  description = FnDeployCollection;
  schema = ZDeployCollection.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const result = await this.kit.deployCollection(input);

      return JSON.stringify({
        status: "success",
        message: "Collection deployed successfully",
        res: {
          collectionAddress: result.collectionAddress.toString(),
          name: input.name,
        },
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

export class MintNFTTool extends StructuredTool<ZodObjectAny> {
  name = "mint_nft";
  description = FnMintNFT(this.kit.wallet_address.toString());
  schema = ZMintNFT.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const result = await this.kit.mintNFT(
        new PublicKey(input.collectionMint),
        {
          name: input.name,
          uri: input.uri,
        },
        input.recipient
          ? new PublicKey(input.recipient)
          : this.kit.wallet_address,
      );

      return JSON.stringify({
        status: "success",
        message: "NFT minted successfully",
        res: {
          mintAddress: result.mint.toString(),
          metadata: {
            name: input.name,
            uri: input.uri,
          },
          recipient: input.recipient || result.mint.toString(),
        },
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

export class TradeTool extends StructuredTool<ZodObjectAny> {
  name = "trade";
  description = FnTrade;
  schema = ZTrade.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.trade(
        new PublicKey(input.outputMint),
        input.inputAmount,
        input.inputMint
          ? new PublicKey(input.inputMint)
          : new PublicKey("So11111111111111111111111111111111111111112"),
        input.slippageBps,
      );

      return JSON.stringify({
        status: "success",
        message: "Trade executed successfully",
        res: {
          transaction: tx,
          inputAmount: input.inputAmount,
          inputToken: input.inputMint || "SOL",
          outputToken: input.outputMint,
        },
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

export class RequestFundsTool extends StructuredTool<ZodObjectAny> {
  name = "request_funds";
  description = FnRequestFunds;
  schema = ZRequestFunds.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: z.output<ZodObjectAny>): Promise<string> {
    try {
      await this.kit.requestFaucetFunds();

      return JSON.stringify({
        status: "success",
        message: "Successfully requested faucet funds",
        res: {
          network: this.kit.connection.rpcEndpoint.split("/")[2],
        },
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

export class RegisterDomainTool extends StructuredTool<ZodObjectAny> {
  name = "register_domain";
  description = FnRegisterDomain;
  schema = ZRegisterDomain.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.registerDomain(input.name, input.spaceKB || 1);

      return JSON.stringify({
        status: "success",
        message: "Domain registered successfully",
        res: {
          transaction: tx,
          domain: `${input.name}.sol`,
          spaceKB: input.spaceKB || 1,
        },
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

export class ResolveDomainTool extends StructuredTool<ZodObjectAny> {
  name = "resolve_domain";
  description = FnResolveDomain;
  schema = ZResolveDomain.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const domain = input.domain.trim();
      const publicKey = await this.kit.resolveSolDomain(domain);

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        res: {
          publicKey: publicKey.toBase58(),
        },
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

export class GetDomainTool extends StructuredTool<ZodObjectAny> {
  name = "get_domain";
  description = FnGetDomainList;
  schema = ZGetDomainList.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const account = new PublicKey(input.account.trim());
      const domain = await this.kit.getPrimaryDomain(account);

      return JSON.stringify({
        status: "success",
        message: "Primary domain retrieved successfully",
        res: {
          domain: domain,
          account: account.toBase58(),
        },
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

export class GetWalletAddressTool extends StructuredTool<ZodObjectAny> {
  name = "get_wallet_address";
  description = FnGetWalletAddress;
  schema = ZGetWalletAddress.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(_input: z.output<ZodObjectAny>): Promise<string> {
    return JSON.stringify({
      status: "success",
      res: {
        walletAddress: this.kit.wallet_address.toString(),
      },
    });
  }
}

export class PumpfunTokenLaunchTool extends StructuredTool<ZodObjectAny> {
  name = "launch_pumpfun_token";

  description = FnPumpFunTokenLaunch;
  schema = ZPumpFunTokenLaunch.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      // Launch token with validated input
      await this.kit.launchPumpFunToken(
        input.tokenName,
        input.tokenTicker,
        input.description,
        input.imageUrl,
        input.options,
      );

      return JSON.stringify({
        status: "success",
        message: "Token launched successfully on Pump.fun",
        tokenName: input.tokenName,
        tokenTicker: input.tokenTicker,
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

export class CreateImageTool extends StructuredTool<ZodObjectAny> {
  name = "create_image";
  description = FnCreateImageTool;
  schema = ZCreateImageTool.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const result = await create_image(this.kit, input.prompt.trim());

      return JSON.stringify({
        status: "success",
        message: "Image created successfully",
        res: result,
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

export class LendAssetTool extends StructuredTool<ZodObjectAny> {
  name = "lend_asset";
  description = FnLendAssetTool;
  schema = ZLendAssetTool.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.lendAssets(input.amount);

      return JSON.stringify({
        status: "success",
        message: "Asset lent successfully",
        res: {
          transaction: tx,
          amount: input.amount,
        },
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

export class TPSCalculatorTool extends StructuredTool<ZodObjectAny> {
  name = "get_tps";
  description = FnTPSCalculatorTool;
  schema = ZTPSCalculatorTool.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(_input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tps = await this.kit.getTPS();
      return JSON.stringify({
        status: "success",
        message: `Solana (mainnet-beta) current transactions per second: ${tps}`,
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

export class StakeTool extends StructuredTool<ZodObjectAny> {
  name = "stake";
  description = FnStakeTool;
  schema = ZStakeTool.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.stake(input.amount);

      return JSON.stringify({
        status: "success",
        message: "Staked successfully",
        res: {
          transaction: tx,
          amount: input.amount,
        },
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

/**
 * Tool to fetch the price of a token in USDC
 */
export class FetchPriceTool extends StructuredTool<ZodObjectAny> {
  name = "fetch_price";
  description = FnFetchPrice;
  schema = ZFetchPrice.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const price = await this.kit.fetchTokenPrice(input.tokenId);
      return JSON.stringify({
        status: "success",
        res: {
          tokenId: input.tokenId.trim(),
          priceInUSDC: price,
        },
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

export class TokenDataTool extends StructuredTool<ZodObjectAny> {
  name = "token_data";
  description = FnTokenData;
  schema = ZTokenData.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tokenData = await this.kit.getTokenDataByAddress(input.mintAddress);

      return JSON.stringify({
        status: "success",
        message: "Token data fetched successfully",
        res: {
          tokenData: tokenData,
        },
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

export class TokenDataByTickerTool extends StructuredTool<ZodObjectAny> {
  name = "token_data_by_ticker";
  description = FnTokenDataByTicker;
  schema = ZTokenDataByTicker.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tokenData = await this.kit.getTokenDataByTicker(input.ticker);
      return JSON.stringify({
        status: "success",
        message: "Token data fetched successfully",
        res: {
          tokenData: tokenData,
        },
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

export class CompressedAirdropTool extends StructuredTool<ZodObjectAny> {
  name = "compressed_airdrop";
  description = FnCompressedAirdrop;
  schema = ZCompressedAirdrop.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const txs = await this.kit.sendCompressedAirdrop(
        input.mintAddress,
        input.amount,
        input.decimals,
        input.recipients,
        input.priorityFeeInLamports,
        input.shouldLog,
      );

      return JSON.stringify({
        status: "success",
        message: `Airdropped ${input.amount} tokens to ${input.recipients.length} recipients.`,
        res: {
          transactionHashes: txs,
        },
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

export class CreateSingleSidedWhirlpoolTool extends StructuredTool<ZodObjectAny> {
  name = "create_orca_single_sided_whirlpool";
  description = FnCreateSingleSidedWhirlpool;
  schema = ZCreateSingleSidedWhirlpool.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const depositTokenAmount = new BN(input.depositTokenAmount);
      const depositTokenMint = new PublicKey(input.depositTokenMint);
      const otherTokenMint = new PublicKey(input.otherTokenMint);
      const initialPrice = new Decimal(input.initialPrice);
      const maxPrice = new Decimal(input.maxPrice);
      const feeTier = input.feeTier;

      const txId = await this.kit.createOrcaSingleSidedWhirlpool(
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
        res: {
          transaction: txId,
        },
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

export class RaydiumCreateAmmV4 extends StructuredTool<ZodObjectAny> {
  name = "raydium_create_ammV4";
  description = FnRaydiumCreateAmmV4;
  schema = ZRaydiumCreateAmmV4.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.raydiumCreateAmmV4(
        new PublicKey(input.marketId),
        new BN(input.baseAmount),
        new BN(input.quoteAmount),
        new BN(input.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Create raydium amm v4 pool successfully",
        res: {
          transaction: tx,
        },
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

export class RaydiumCreateClmm extends StructuredTool<ZodObjectAny> {
  name = "raydium_create_clmm";
  description = FnRaydiumCreateClmm;
  schema = ZRaydiumCreateClmm.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.raydiumCreateClmm(
        new PublicKey(input.mint1),
        new PublicKey(input.mint2),

        new PublicKey(input.configId),

        new Decimal(input.initialPrice),
        new BN(input.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Create raydium clmm pool successfully",
        res: {
          transaction: tx,
        },
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

export class RaydiumCreateCpmm extends StructuredTool<ZodObjectAny> {
  name = "raydium_create_cpmm";
  description = FnRaydiumCreateCpmm;
  schema = ZRaydiumCreateCpmm.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.raydiumCreateCpmm(
        new PublicKey(input.mint1),
        new PublicKey(input.mint2),

        new PublicKey(input.configId),

        new BN(input.mintAAmount),
        new BN(input.mintBAmount),

        new BN(input.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Create raydium cpmm pool successfully",
        res: {
          transaction: tx,
        },
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

export class OpenBookCreateMarket extends StructuredTool<ZodObjectAny> {
  name = "open_book_create_market";
  description = FnOpenbookCreateMarket;
  schema = ZOpenbookCreateMarket.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const tx = await this.kit.openbookCreateMarket(
        new PublicKey(input.baseMint),
        new PublicKey(input.quoteMint),

        input.lotSize,
        input.tickSize,
      );

      return JSON.stringify({
        status: "success",
        message: "Create openbook market successfully",
        res: {
          transaction: tx,
        },
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

export class PythFetchPrice extends StructuredTool<ZodObjectAny> {
  name = "pyth_fetch_price";
  description = FnPythFetchPrice;
  schema = ZPythFetchPrice.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const price = await this.kit.pythFetchPrice(input.priceFeedID);
      return JSON.stringify({
        status: "success",
        message: "Price fetched successfully",
        res: {
          price,
          priceFeedID: input.priceFeedID,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        data: {
          priceFeedID: input,
        },
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
/// Fixme: this tool is repetation of Resolve Domain Might need to remove it
export class ResolveAllDomainsTool extends StructuredTool<ZodObjectAny> {
  name = "resolve_all_domains";
  description = FnResolveAllDomains;
  schema = ZResolveAllDomains.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const owner = await this.kit.resolveAllDomains(input.domain);

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
        res: {
          owner: owner?.toString(),
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DOMAIN_RESOLUTION_ERROR",
      });
    }
  }
}

export class GetOwnedDomains extends StructuredTool<ZodObjectAny> {
  name = "get_owned_domains";
  description = FnGetOwnedDomains;
  schema = ZGetOwnedDomains.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.owner);
      const domains = await this.kit.getOwnedAllDomains(ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Owned domains fetched successfully",
        res: {
          domains: domains,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_OWNED_DOMAINS_ERROR",
      });
    }
  }
}

export class GetOwnedTldDomains extends StructuredTool<ZodObjectAny> {
  name = "get_owned_tld_domains";
  description = FnGetOwnedTldDomains;
  schema = ZGetOwnedTldDomains.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const domains = await this.kit.getOwnedDomainsForTLD(input.tld);

      return JSON.stringify({
        status: "success",
        message: "TLD domains fetched successfully",
        res: {
          domains: domains,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLD_DOMAINS_ERROR",
      });
    }
  }
}

export class GetAllTlds extends StructuredTool<ZodObjectAny> {
  name = "get_all_tlds";
  description = FnGetAllTlds;
  schema = ZGetAllTlds.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const tlds = await this.kit.getAllDomainsTLDs();

      return JSON.stringify({
        status: "success",
        message: "TLDs fetched successfully",
        res: {
          tlds: tlds,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLDS_ERROR",
      });
    }
  }
}

export class GetMainDomain extends StructuredTool<ZodObjectAny> {
  name = "get_main_domain";
  description = FnGetMainDomain;
  schema = ZGetMainDomain.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const mainDomain = await this.kit.getMainAllDomainsDomain(ownerPubkey);

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
}

export class CreateGibworkTask extends StructuredTool<ZodObjectAny> {
  name = "create_gibwork_task";
  description = FnCreateGibworkTask;
  schema = ZCreateGibworkTask.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const taskData = await this.kit.createGibworkTask(
        input.title,
        input.content,
        input.requirements,
        input.tags,
        input.tokenMintAddress,
        input.amount,
        input.payer,
      );
      return JSON.stringify({
        status: "success",
        message: "Task created successfully",
        res: {
          taskId: taskData.taskId,
          signature: taskData.signature,
        },
      });
    } catch (err: any) {
      return JSON.stringify({
        status: "error",
        message: err.message,
        code: err.code || "CREATE_TASK_ERROR",
      });
    }
  }
}

export class TipLinkTool extends StructuredTool<ZodObjectAny> {
  name = "tiplink";
  description = FnTipLink;
  schema = ZTipLink.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const amount = input.amount;
      const splmintAddress = input.splmintAddress
        ? new PublicKey(input.splmintAddress)
        : undefined;

      const { url, signature } = await this.kit.createTiplink(
        amount,
        splmintAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "TipLink created successfully",
        res: {
          url,
          signature,
          amount,
          tokenType: splmintAddress ? "SPL" : "SOL",
        },
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

export class RockPaperScissorsTool extends StructuredTool<ZodObjectAny> {
  name = "rock_paper_scissors";
  description = FnRockPaperScissors;
  schema = ZRockPaperScissors.strip();

  constructor(private kit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: z.output<ZodObjectAny>): Promise<string> {
    try {
      const result = await this.kit.rockPaperScissors(
        Number(input.amount),
        input.choice.replace(/^"|"$/g, "") as "rock" | "paper" | "scissors",
      );

      return JSON.stringify({
        status: "success",
        message: "Rock Paper Scissors played successfully",
        res: {
          result,
        },
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

export function createSolanaTools(kit: SolanaAgentKit) {
  return [
    new BalanceTool(kit),
    new TransferTool(kit),
    new DeployTokenTool(kit),
    new DeployCollectionTool(kit),
    new MintNFTTool(kit),
    new TradeTool(kit),
    new RequestFundsTool(kit),
    new RegisterDomainTool(kit),
    new GetDomainTool(kit),
    new ResolveDomainTool(kit),
    new GetWalletAddressTool(kit),
    new PumpfunTokenLaunchTool(kit),
    new CreateImageTool(kit),
    new LendAssetTool(kit),
    new TPSCalculatorTool(kit),
    new StakeTool(kit),
    new FetchPriceTool(kit),
    new TokenDataTool(kit),
    new TokenDataByTickerTool(kit),
    new CompressedAirdropTool(kit),
    new CreateSingleSidedWhirlpoolTool(kit),
    new RaydiumCreateAmmV4(kit),
    new RaydiumCreateClmm(kit),
    new RaydiumCreateCpmm(kit),
    new OpenBookCreateMarket(kit),
    new PythFetchPrice(kit),
    new GetOwnedDomains(kit),
    new GetOwnedTldDomains(kit),
    new GetAllTlds(kit),
    new GetMainDomain(kit),
    new ResolveAllDomainsTool(kit),
    new CreateGibworkTask(kit),
    new RockPaperScissorsTool(kit),
    new TipLinkTool(kit),
  ];
}
