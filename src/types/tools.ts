import { z } from "zod";
import { FEE_TIERS } from "../tools";

const ZBalance = z.object({ tokenAddress: z.string().optional() });

const ZTransaction = z.object({
  to: z.string().describe("To who you need make the transaction"),
  amount: z.number().describe("amount of token you want to transfer"),
  mint: z
    .string()
    .optional()
    .describe("from where amount to get transferred from (optional)"),
});

const ZDeployToken = z.object({
  name: z.string().describe("name"),
  uri: z.string().describe("uri"),
  symbol: z.string(),
  decimals: z.number().default(9),
  initialSupply: z.number().optional(),
});

const ZDeployCollection = z.object({
  name: z.string().describe("name"),
  uri: z.string().describe("uri"),
  royaltyBasisPoints: z.number().optional(),
  creators: z.array(z.object({ address: z.string(), percentage: z.number() })),
});

const ZMintNFT = z.object({
  collectionMint: z.string().describe("collectionMint"),
  name: z.string().describe("name"),
  uri: z.string().describe("uri"),
  recipient: z.string().optional(),
});

const ZTrade = z.object({
  outputMint: z.string().describe("input Mint"),
  inputAmount: z.number().describe("amount"),
  inputMint: z.string().describe("Output mint").optional(),
  slippageBps: z.number().default(300),
});

const ZRequestFunds = z.object({});

const ZRegisterDomain = z.object({
  name: z.string().describe("Domain Name (eg: pumpfun.sol)"),
  spaceKB: z.number().min(1).default(1).describe("Space in KB"),
});

const ZResolveDomain = z.object({
  domain: z.string().describe("domain"),
});

const ZGetDomainList = z.object({
  account: z.string().describe("account"),
});

const ZGetWalletAddress = z.object({});

const ZPumpFunTokenLaunch = z.object({
  tokenName: z.string().describe("tokenName"),
  tokenTicker: z.string().describe("tokenTicker"),
  description: z.string().describe("description"),
  imageUrl: z.string().describe("imageUrl"),
  options: z
    .object({
      twitter: z.string().optional(),
      telegram: z.string().optional(),
      website: z.string().optional(),
      initialLiquiditySOL: z.number().optional(),
      slippageBps: z.number().optional(),
      priorityFee: z.number().optional(),
    })
    .optional(),
});

const ZCreateImageTool = z.object({
  prompt: z.string().describe("prompt"),
});

const ZLendAssetTool = z.object({
  amount: z.number().describe("amount"),
});

const ZStakeTool = z.object({
  amount: z.number().describe("amount"),
});

const ZTokenData = z.object({
  mintAddress: z.string().describe("mintAddress"),
});

const ZTPSCalculatorTool = z.object({});

const ZFetchPrice = z.object({
  tokenId: z.string().describe("tokenId"),
});

const ZTokenDataByTicker = z.object({
  ticker: z.string().describe("ticker"),
});

const ZCompressedAirdrop = z.object({
  mintAddress: z.string().describe("mintAddress"),
  amount: z.number().describe("amount"),
  decimals: z.number().describe("decimals"),
  recipients: z.array(z.string()).describe("recipients"),
  priorityFeeInLamports: z
    .number()
    .default(30000)
    .describe("priorityFeeInLamports"),
  shouldLog: z.boolean().default(false).describe("shouldLog"),
});

const ZCreateSingleSidedWhirlpool = z.object({
  depositTokenAmount: z.number().describe("depositTokenAmount"),
  depositTokenMint: z.string().describe("depositTokenMint"),
  otherTokenMint: z.string().describe("otherTokenMint"),
  initialPrice: z.number().describe("initialPrice"),
  maxPrice: z.number().describe("maxPrice"),
  feeTier: z
    .enum(
      [0.01, 0.02, 0.04, 0.05, 0.16, 0.3, 0.65, 1.0, 2.0].map(String) as [
        string,
        ...string[],
      ],
    )
    .transform((val) => parseFloat(val))
    .describe("feeTier"),
  // z.coerce.number().refine(val => Object.keys(FEE_TIERS).includes(String(val)))
  //   .describe("feeTier"),
});

const ZRaydiumCreateAmmV4 = z.object({
  marketId: z.string().describe("marketId"),
  baseAmount: z.number().describe("baseAmount"),
  quoteAmount: z.number().describe("quoteAmount"),
  startTime: z.number().describe("startTime"),
});

const ZRaydiumCreateClmm = z.object({
  mint1: z.string().describe("mint1"),
  mint2: z.string().describe("mint2"),
  configId: z.string().describe("configId"),
  initialPrice: z.number().describe("initialPrice"),
  startTime: z.number().describe("startTime"),
});

const ZRaydiumCreateCpmm = z.object({
  mint1: z.string().describe("mint1"),
  mint2: z.string().describe("mint2"),
  configId: z.string().describe("configId"),
  mintAAmount: z.number().describe("mintAAmount"),
  mintBAmount: z.number().describe("mintBAmount"),
  startTime: z.number().describe("startTime"),
});

const ZOpenbookCreateMarket = z.object({
  baseMint: z.string().describe("baseMint"),
  quoteMint: z.string().describe("quoteMint"),
  lotSize: z.number().describe("lotSize"),
  tickSize: z.number().describe("tickSize"),
});

const ZPythFetchPrice = z.object({
  priceFeedID: z.string().describe("priceFeedID"),
});

const ZResolveAllDomains = z.object({
  domain: z.string().describe("domain"),
});

const ZGetOwnedDomains = z.object({
  owner: z.string().describe("address of the owner"),
});

const ZGetOwnedTldDomains = z.object({
  tld: z.string().describe("tld"),
});

const ZGetAllTlds = z.object({});

const ZGetMainDomain = z.object({
  owner: z.string().describe("owner"),
});

const ZCreateGibworkTask = z.object({
  title: z.string().describe("title"),
  content: z.string().describe("content"),
  requirements: z.string().describe("requirements"),
  tags: z.array(z.string()).describe("tags"),
  payer: z.string().describe("payer"),
  tokenMintAddress: z.string().describe("tokenMintAddress"),
  amount: z.number().describe("amount"),
});

const ZTipLink = z.object({
  amount: z.number().describe("amount"),
  splmintAddress: z.string().describe("splmintAddress"),
});

const ZRockPaperScissors = z.object({
  choice: z.string().describe("choice"),
  amount: z.number().describe("amount"),
});

export {
  ZBalance,
  ZTransaction,
  ZDeployToken,
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
  ZStakeTool,
  ZTokenData,
  ZTPSCalculatorTool,
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
};
