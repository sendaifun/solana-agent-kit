import { tool } from "ai";
import { SolanaAgentKit } from "../index";
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
  FnStakeTool,
  FnTipLink,
  FnTokenData,
  FnTokenDataByTicker,
  FnTPSCalculatorTool,
  FnTrade,
  FnTransaction,
} from "../../constants/tools";
import { PublicKey } from "@solana/web3.js";
import {
  ZBalance,
  ZCreateImageTool,
  ZDeployCollection,
  ZDeployToken,
  ZGetDomainList,
  ZGetWalletAddress,
  ZMintNFT,
  ZPumpFunTokenLaunch,
  ZRegisterDomain,
  ZRequestFunds,
  ZResolveDomain,
  ZTrade,
  ZTransaction,
  ZLendAssetTool,
  ZTPSCalculatorTool,
  ZStakeTool,
  ZFetchPrice,
  ZTokenData,
  ZTokenDataByTicker,
  ZCreateSingleSidedWhirlpool,
  ZTipLink,
  ZCreateGibworkTask,
  ZGetMainDomain,
  ZGetAllTlds,
  ZGetOwnedTldDomains,
  ZGetOwnedDomains,
  ZResolveAllDomains,
  ZPythFetchPrice,
  ZOpenbookCreateMarket,
  ZRaydiumCreateCpmm,
  ZRaydiumCreateClmm,
  ZRaydiumCreateAmmV4,
  ZCompressedAirdrop,
} from "../../types/tools";
import { create_image } from "../../tools/create_image";
import BN from "bn.js";
import Decimal from "decimal.js";
import { FEE_TIERS } from "../../tools";

const balanceTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnBalance,
    parameters: ZBalance,
    execute: async ({ tokenAddress }) => {
      try {
        const address = tokenAddress ? new PublicKey(tokenAddress) : undefined;
        const balance = await kit.getBalance(address);
        return {
          status: "success",
          balance: balance,
          token: tokenAddress || "SOL",
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const transferTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnTransaction,
    parameters: ZTransaction,
    execute: async ({ to, amount, mint }) => {
      try {
        const recipient = new PublicKey(to);
        const mintAddress = mint ? new PublicKey(mint) : undefined;

        const tx = await kit.transfer(recipient, amount, mintAddress);

        return {
          status: "success",
          message: "Transfer completed successfully",
          res: {
            amount: amount,
            recipient: to,
            token: mint || "SOL",
            transaction: tx,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const deployTokenTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnDeployToken,
    parameters: ZDeployToken,
    execute: async ({ name, uri, symbol, decimals, initialSupply }) => {
      try {
        const result = await kit.deployToken(
          name,
          uri,
          symbol,
          decimals,
          initialSupply,
        );

        return {
          status: "success",
          message: "Token deployed successfully",
          res: {
            mint: result.mint.toString(),
            decimals: decimals,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const deployCollectionTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnDeployCollection,
    parameters: ZDeployCollection,
    execute: async ({ name, uri, royaltyBasisPoints, creators }) => {
      try {
        const result = await kit.deployCollection({
          name,
          uri,
          royaltyBasisPoints,
          creators,
        });

        return {
          status: "success",
          message: "Token deployed successfully",
          res: {
            collectionAddress: result.collectionAddress.toString(),
            name: name,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const mintNFTTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnMintNFT(kit.wallet_address.toString()),
    parameters: ZMintNFT,
    execute: async ({ collectionMint, name, uri, recipient }) => {
      try {
        const result = await kit.mintNFT(
          new PublicKey(collectionMint),
          {
            name: name,
            uri: uri,
          },
          recipient ? new PublicKey(recipient) : kit.wallet_address,
        );

        return {
          status: "success",
          message: "NFT minted successfully",
          res: {
            mintAddress: result.mint.toString(),
            metadata: {
              name: name,
              uri: uri,
            },
            recipient: recipient || result.mint.toString(),
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const tradeTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnTrade,
    parameters: ZTrade,
    execute: async (input) => {
      try {
        const tx = await kit.trade(
          new PublicKey(input.outputMint),
          input.inputAmount,
          input.inputMint
            ? new PublicKey(input.inputMint)
            : new PublicKey("So11111111111111111111111111111111111111112"),
          input.slippageBps,
        );

        return {
          status: "success",
          message: "Trade executed successfully",
          res: {
            transaction: tx,
            inputAmount: input.inputAmount,
            inputToken: input.inputMint || "SOL",
            outputToken: input.outputMint,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const requestFundsTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnRequestFunds,
    parameters: ZRequestFunds,
    execute: async (_input) => {
      try {
        await kit.requestFaucetFunds();

        return {
          status: "success",
          message: "Successfully requested faucet funds",
          res: {
            network: kit.connection.rpcEndpoint.split("/")[2],
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const registerDomainTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnRegisterDomain,
    parameters: ZRegisterDomain,
    execute: async (input) => {
      try {
        const tx = await kit.registerDomain(input.name, input.spaceKB || 1);
        return {
          status: "success",
          message: "Domain registered successfully",
          res: {
            transaction: tx,
            domain: `${input.name}.sol`,
            spaceKB: input.spaceKB || 1,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const resolveDomainTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnResolveDomain,
    parameters: ZResolveDomain,
    execute: async (input) => {
      try {
        const domain = input.domain.trim();
        const publicKey = await kit.resolveSolDomain(domain);

        return {
          status: "success",
          message: "Domain resolved successfully",
          res: {
            publicKey: publicKey.toBase58(),
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const getDomainTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnGetDomainList,
    parameters: ZGetDomainList,
    execute: async (input) => {
      try {
        const account = new PublicKey(input.account.trim());
        const domain = await kit.getPrimaryDomain(account);

        return {
          status: "success",
          message: "Primary domain retrieved successfully",
          res: {
            domain: domain,
            account: account.toBase58(),
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const getWalletAddress = (kit: SolanaAgentKit) =>
  tool({
    description: FnGetWalletAddress,
    parameters: ZGetWalletAddress,
    execute: async (_input) => {
      return {
        status: "success",
        res: {
          walletAddress: kit.wallet_address.toString(),
        },
      };
    },
  });

const pumpFunTokenLaunch = (kit: SolanaAgentKit) =>
  tool({
    description: FnPumpFunTokenLaunch,
    parameters: ZPumpFunTokenLaunch,
    execute: async (input) => {
      try {
        // Launch token with validated input
        await kit.launchPumpFunToken(
          input.tokenName,
          input.tokenTicker,
          input.description,
          input.imageUrl,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error @ts-ignore
          input.options,
        );

        return {
          status: "success",
          message: "Token launched successfully on Pump.fun",
          tokenName: input.tokenName,
          tokenTicker: input.tokenTicker,
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const createImageTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnCreateImageTool,
    parameters: ZCreateImageTool,
    execute: async (input) => {
      try {
        const result = await create_image(kit, input.prompt.trim());

        return {
          status: "success",
          message: "Image created successfully",
          res: result,
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const lendAssetTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnLendAssetTool,
    parameters: ZLendAssetTool,
    execute: async (input) => {
      try {
        const tx = await kit.lendAssets(input.amount);

        return {
          status: "success",
          message: "Asset lent successfully",
          res: {
            transaction: tx,
            amount: input.amount,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const tpsCalculatorTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnTPSCalculatorTool,
    parameters: ZTPSCalculatorTool,
    execute: async (_input) => {
      try {
        const tps = await kit.getTPS();
        return {
          status: "success",
          message: `Solana (mainnet-beta) current transactions per second: ${tps}`,
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const stakeTool = (kit: SolanaAgentKit) =>
  tool({
    description: FnStakeTool,
    parameters: ZStakeTool,
    execute: async (input) => {
      try {
        const tx = await kit.stake(input.amount);

        return {
          status: "success",
          message: "Staked successfully",
          res: {
            transaction: tx,
            amount: input.amount,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const fetchPrice = (kit: SolanaAgentKit) =>
  tool({
    description: FnFetchPrice,
    parameters: ZFetchPrice,
    execute: async (input) => {
      try {
        const price = await kit.fetchTokenPrice(input.tokenId);
        return {
          status: "success",
          message: "Price fetched successfully",
          res: {
            tokenId: input.tokenId.trim(),
            priceInUSDC: price,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const tokenData = (kit: SolanaAgentKit) =>
  tool({
    description: FnTokenData,
    parameters: ZTokenData,
    execute: async (input) => {
      try {
        const tokenData = await kit.getTokenDataByAddress(input.mintAddress);

        return {
          status: "success",
          message: "Token data fetched successfully",
          res: {
            tokenData: tokenData,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const tokenDataByTicker = (kit: SolanaAgentKit) =>
  tool({
    description: FnTokenDataByTicker,
    parameters: ZTokenDataByTicker,
    execute: async (input) => {
      try {
        const tokenData = await kit.getTokenDataByTicker(input.ticker);
        return {
          status: "success",
          message: "Token data fetched successfully",
          res: {
            tokenData: tokenData,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const compressedAirdrop = (kit: SolanaAgentKit) =>
  tool({
    description: FnCompressedAirdrop,
    parameters: ZCompressedAirdrop,
    execute: async (input) => {
      try {
        const txId = await kit.sendCompressedAirdrop(
          input.mintAddress,
          input.amount,
          input.decimals,
          input.recipients,
          input.priorityFeeInLamports,
          input.shouldLog,
        );

        return {
          status: "success",
          message: "Airdropped successfully",
          res: {
            transactionHashes: txId,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const createSingleSidedWhirlpool = (kit: SolanaAgentKit) =>
  tool({
    description: FnCreateSingleSidedWhirlpool,
    parameters: ZCreateSingleSidedWhirlpool,
    execute: async (input) => {
      try {
        const txId = await kit.createOrcaSingleSidedWhirlpool(
          new BN(input.depositTokenAmount),
          new PublicKey(input.depositTokenMint),
          new PublicKey(input.otherTokenMint),
          new Decimal(input.initialPrice),
          new Decimal(input.maxPrice),
          input.feeTier as keyof typeof FEE_TIERS,
        );

        return {
          status: "success",
          message: "Single-sided whirlpool created successfully",
          res: {
            transaction: txId,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const raydiumCreateAmmV4 = (kit: SolanaAgentKit) =>
  tool({
    description: FnRaydiumCreateAmmV4,
    parameters: ZRaydiumCreateAmmV4,
    execute: async (input) => {
      try {
        const txId = await kit.raydiumCreateAmmV4(
          new PublicKey(input.marketId),
          new BN(input.baseAmount),
          new BN(input.quoteAmount),
          new BN(input.startTime),
        );

        return {
          status: "success",
          message: "Create raydium amm v4 pool successfully",
          res: {
            transaction: txId,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const raydiumCreateClmm = (kit: SolanaAgentKit) =>
  tool({
    description: FnRaydiumCreateClmm,
    parameters: ZRaydiumCreateClmm,
    execute: async (input) => {
      try {
        const txId = await kit.raydiumCreateClmm(
          new PublicKey(input.mint1),
          new PublicKey(input.mint2),
          new PublicKey(input.configId),
          new Decimal(input.initialPrice),
          new BN(input.startTime),
        );

        return {
          status: "success",
          message: "Create raydium clmm pool successfully",
          res: {
            transaction: txId,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const raydiumCreateCpmm = (kit: SolanaAgentKit) =>
  tool({
    description: FnRaydiumCreateCpmm,
    parameters: ZRaydiumCreateCpmm,
    execute: async (input) => {
      try {
        const txId = await kit.raydiumCreateCpmm(
          new PublicKey(input.mint1),
          new PublicKey(input.mint2),
          new PublicKey(input.configId),
          new BN(input.mintAAmount),
          new BN(input.mintBAmount),
          new BN(input.startTime),
        );

        return {
          status: "success",
          message: "Create raydium cpmm pool successfully",
          res: {
            transaction: txId,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const openbookCreateMarket = (kit: SolanaAgentKit) =>
  tool({
    description: FnOpenbookCreateMarket,
    parameters: ZOpenbookCreateMarket,
    execute: async (input) => {
      try {
        const txId = await kit.openbookCreateMarket(
          new PublicKey(input.baseMint),
          new PublicKey(input.quoteMint),
          input.lotSize,
          input.tickSize,
        );

        return {
          status: "success",
          message: "Create openbook market successfully",
          res: {
            transaction: txId,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const pythFetchPrice = (kit: SolanaAgentKit) =>
  tool({
    description: FnPythFetchPrice,
    parameters: ZPythFetchPrice,
    execute: async (input) => {
      try {
        const price = await kit.pythFetchPrice(input.priceFeedID);
        return {
          status: "success",
          message: "Price fetched successfully",
          res: {
            priceFeedID: input.priceFeedID,
            price: price,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const resolveAllDomains = (kit: SolanaAgentKit) =>
  tool({
    description: FnResolveAllDomains,
    parameters: ZResolveAllDomains,
    execute: async (input) => {
      try {
        const owner = await kit.resolveAllDomains(input.domain);

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
          res: {
            owner: owner?.toString(),
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "DOMAIN_RESOLUTION_ERROR",
        };
      }
    },
  });

const getOwnedDomains = (kit: SolanaAgentKit) =>
  tool({
    description: FnGetOwnedDomains,
    parameters: ZGetOwnedDomains,
    execute: async (input) => {
      try {
        const ownerPubkey = new PublicKey(input.owner);
        const domains = await kit.getOwnedAllDomains(ownerPubkey);

        return {
          status: "success",
          message: "Owned domains fetched successfully",
          res: {
            domains: domains,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "FETCH_OWNED_DOMAINS_ERROR",
        };
      }
    },
  });

const getOwnedTldDomains = (kit: SolanaAgentKit) =>
  tool({
    description: FnGetOwnedTldDomains,
    parameters: ZGetOwnedTldDomains,
    execute: async (input) => {
      try {
        const domains = await kit.getOwnedDomainsForTLD(input.tld);

        return {
          status: "success",
          message: "TLD domains fetched successfully",
          res: {
            domains: domains,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "FETCH_TLD_DOMAINS_ERROR",
        };
      }
    },
  });

const getAllTlds = (kit: SolanaAgentKit) =>
  tool({
    description: FnGetAllTlds,
    parameters: ZGetAllTlds,
    execute: async () => {
      try {
        const tlds = await kit.getAllDomainsTLDs();
        return {
          status: "success",
          message: "TLDs fetched successfully",
          res: {
            tlds: tlds,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "FETCH_TLDS_ERROR",
        };
      }
    },
  });

const getMainDomain = (kit: SolanaAgentKit) =>
  tool({
    description: FnGetMainDomain,
    parameters: ZGetMainDomain,
    execute: async (input) => {
      try {
        const ownerPubkey = new PublicKey(input.owner);
        const mainDomain = await kit.getMainAllDomainsDomain(ownerPubkey);

        return {
          status: "success",
          message: "Main domain fetched successfully",
          res: {
            domain: mainDomain,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "FETCH_MAIN_DOMAIN_ERROR",
        };
      }
    },
  });

const createGibworkTask = (kit: SolanaAgentKit) =>
  tool({
    description: FnCreateGibworkTask,
    parameters: ZCreateGibworkTask,
    execute: async (input) => {
      try {
        const taskData = await kit.createGibworkTask(
          input.title,
          input.content,
          input.requirements,
          input.tags,
          input.tokenMintAddress,
          input.amount,
          input.payer,
        );
        return {
          status: "success",
          message: "Task created successfully",
          res: {
            taskId: taskData.taskId,
            signature: taskData.signature,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

const tiplink = (kit: SolanaAgentKit) =>
  tool({
    description: FnTipLink,
    parameters: ZTipLink,
    execute: async (input) => {
      try {
        const splmintAddress = input.splmintAddress
          ? new PublicKey(input.splmintAddress)
          : undefined;

        const { url, signature } = await kit.createTiplink(
          input.amount,
          splmintAddress,
        );

        return {
          status: "success",
          message: "TipLink created successfully",
          res: {
            url,
            signature,
            amount: input.amount,
            tokenType: splmintAddress ? "SPL" : "SOL",
            message: `TipLink created successfully`,
          },
        };
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        };
      }
    },
  });

function createSolanaTools(kit: SolanaAgentKit) {
  return {
    balanceTool: balanceTool(kit),
    transferTool: transferTool(kit),
    deployTokenTool: deployTokenTool(kit),
    deployCollectionTool: deployCollectionTool(kit),
    mintNFTTool: mintNFTTool(kit),
    tradeTool: tradeTool(kit),
    requestFundsTool: requestFundsTool(kit),
    registerDomainTool: registerDomainTool(kit),
    resolveDomainTool: resolveDomainTool(kit),
    getDomainTool: getDomainTool(kit),
    getWalletAddress: getWalletAddress(kit),
    pumpFunTokenLaunch: pumpFunTokenLaunch(kit),
    createImageTool: createImageTool(kit),
    lendAssetTool: lendAssetTool(kit),
    tpsCalculatorTool: tpsCalculatorTool(kit),
    stakeTool: stakeTool(kit),
    fetchPrice: fetchPrice(kit),
    tokenData: tokenData(kit),
    tokenDataByTicker: tokenDataByTicker(kit),
    compressedAirdrop: compressedAirdrop(kit),
    createSingleSidedWhirlpool: createSingleSidedWhirlpool(kit),
    raydiumCreateAmmV4: raydiumCreateAmmV4(kit),
    raydiumCreateClmm: raydiumCreateClmm(kit),
    raydiumCreateCpmm: raydiumCreateCpmm(kit),
    openbookCreateMarket: openbookCreateMarket(kit),
    pythFetchPrice: pythFetchPrice(kit),
    resolveAllDomains: resolveAllDomains(kit),
    getOwnedDomains: getOwnedDomains(kit),
    getOwnedTldDomains: getOwnedTldDomains(kit),
    getAllTlds: getAllTlds(kit),
    getMainDomain: getMainDomain(kit),
    createGibworkTask: createGibworkTask(kit),
    tiplink: tiplink(kit),
  };
}

export { createSolanaTools };
