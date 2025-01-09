import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import Decimal from "decimal.js";
import { Tool } from "langchain/tools";
import {
  GibworkCreateTaskReponse,
  OrderParams,
  PythFetchPriceResponse,
  SolanaAgentKit,
} from "../index";
import { create_image, FEE_TIERS, generateOrdersfromPattern } from "../tools";
import { marketTokenMap } from "../utils/flashUtils";
import {
  CreateCollectionOptions,
  CreateSingleOptions,
  StoreInitOptions,
} from "@3land/listings-sdk/dist/types/implementation/implementationTypes";

import { SolanaBalanceTool } from "./SolanaBalanceTool";
import { SolanaBalanceOtherTool } from "./SolanaBalanceOtherTool";
import { SolanaTransferTool } from "./SolanaTransferTool";
import { SolanaDeployTokenTool } from "./SolanaDeployTokenTool";
import { SolanaDeployCollectionTool } from "./SolanaDeployCollectionTool";
import { SolanaPerpCloseTradeTool } from "./SolanaPerpCloseTradeTool";
import { SolanaPerpOpenTradeTool } from "./SolanaPerpOpenTradeTool";
import { SolanaTradeTool } from "./SolanaTradeTool";
import { SolanaLimitOrderTool } from "./SolanaLimitOrderTool";
import { SolanaBatchOrderTool } from "./SolanaBatchOrderTool";
import { SolanaCancelAllOrdersTool } from "./SolanaCancelAllOrdersTool";
import { SolanaWithdrawAllTool } from "./SolanaWithdrawAllTool";
import { SolanaRequestFundsTool } from "./SolanaRequestFundsTool";
import { SolanaRegisterDomainTool } from "./SolanaRegisterDomainTool";
import { SolanaResolveDomainTool } from "./SolanaResolveDomainTool";
import { SolanaGetDomainTool } from "./SolanaGetDomainTool";
import { SolanaGetWalletAddressTool } from "./SolanaGetWalletAddressTool";
import { SolanaFlashOpenTrade } from "./SolanaFlashOpenTrade";
import { SolanaFlashCloseTrade } from "./SolanaFlashCloseTrade";
import { SolanaPumpfunTokenLaunchTool } from "./SolanaPumpfunTokenLaunchTool";
import { SolanaCreateImageTool } from "./SolanaCreateImageTool";
import { SolanaLendAssetTool } from "./SolanaLendAssetTool";
import { SolanaTPSCalculatorTool } from "./SolanaTPSCalculator";
import { SolanaStakeTool } from "./SolanaStakeTool";
import { SolanaRestakeTool } from "./SolanaRestakeTool";
import { SolanaFetchPriceTool } from "./SolanaFetchPriceTool";
import { SolanaTokenDataTool } from "./SolanaTokenDataTool";
import { SolanaTokenDataByTickerTool } from "./SolanaTokenDataByTickerTool";
import { SolanaCompressedAirdropTool } from "./SolanaCompressedAirdropTool";
import { SolanaClosePosition } from "./SolanaClosePosition";
import { SolanaOrcaCreateCLMM } from "./SolanaOrcaCreateCLMM";
import { SolanaOrcaCreateSingleSideLiquidityPool } from "./SolanaOrcaCreateSingleSideLiquidtyPool";
import { SolanaOrcaFetchPositions } from "./SolanaOrcaFetchPosition";
import { SolanaOrcaOpenCenteredPosition } from "./SolanaOrcaOpenCenteredPosition";
import { SolanaOrcaOpenSingleSidedPosition } from "./SolanaOrcaOpenSingleSidedPosition";
import { SolanaRaydiumCreateAmmV4 } from "./SolanaRaydiumCreateAmmV4";
import { SolanaRaydiumCreateClmm } from "./SolanaRaydiumCreateClmm";
import { SolanaRaydiumCreateCpmm } from "./SolanaRaydiumCreateCpmm";
import { SolanaOpenbookCreateMarket } from "./SolanaOpenbookCreateMarket";
import { SolanaManifestCreateMarket } from "./SolanaMainfestCreateMarket";
import { SolanaPythFetchPrice } from "./SolanaPythFetchPrice";
import { SolanaResolveAllDomainsTool } from "./SolanaResolveAllDomainsTool";
import { SolanaGetOwnedDomains } from "./SolanaGetOwnedDomains";
import { SolanaGetOwnedTldDomains } from "./SolanaGetOwnedTldDomains";
import { SolanaGetAllTlds } from "./SolanaGetAllTlds";
import { SolanaGetMainDomain } from "./SolanaGetMainDomain";
import { SolanaCreateGibworkTask } from "./SolanaCreateGibworkTask";
import { SolanaRockPaperScissorsTool } from "./SolanaRockPaperScissorsTool";
import { SolanaTipLinkTool } from "./SolanaTipLinkTool";
import { SolanaListNFTForSaleTool } from "./SolanaListNFTForSaleTool";
import { SolanaCancelNFTListingTool } from "./SolanaCancelNFTListingTool";
import { SolanaFetchTokenReportSummaryTool } from "./SolanaFetchTokenReportSummaryTool";
import { SolanaFetchTokenDetailedReportTool } from "./SolanaFetchTokenDetailedReportTool";
import { Solana3LandCreateSingle } from "./Solana3LandCreateSingle";
import { Solana3LandCreateCollection } from "./Solana3LandCreateCollection";
import { SolanaCloseEmptyTokenAccounts } from "./SolanaCloseEmptyTokenAccounts";
import { SolanaMintNFTTool } from "./SolanaMintNftTool";

export function createSolanaTools(solanaKit: SolanaAgentKit) {
  return [
    new SolanaBalanceTool(solanaKit),
    new SolanaBalanceOtherTool(solanaKit),
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
    new SolanaRestakeTool(solanaKit),
    new SolanaFetchPriceTool(solanaKit),
    new SolanaGetDomainTool(solanaKit),
    new SolanaTokenDataTool(solanaKit),
    new SolanaTokenDataByTickerTool(solanaKit),
    new SolanaCompressedAirdropTool(solanaKit),
    new SolanaRaydiumCreateAmmV4(solanaKit),
    new SolanaRaydiumCreateClmm(solanaKit),
    new SolanaRaydiumCreateCpmm(solanaKit),
    new SolanaOpenbookCreateMarket(solanaKit),
    new SolanaManifestCreateMarket(solanaKit),
    new SolanaLimitOrderTool(solanaKit),
    new SolanaBatchOrderTool(solanaKit),
    new SolanaCancelAllOrdersTool(solanaKit),
    new SolanaWithdrawAllTool(solanaKit),
    new SolanaClosePosition(solanaKit),
    new SolanaOrcaCreateCLMM(solanaKit),
    new SolanaOrcaCreateSingleSideLiquidityPool(solanaKit),
    new SolanaOrcaFetchPositions(solanaKit),
    new SolanaOrcaOpenCenteredPosition(solanaKit),
    new SolanaOrcaOpenSingleSidedPosition(solanaKit),
    new SolanaPythFetchPrice(solanaKit),
    new SolanaResolveDomainTool(solanaKit),
    new SolanaGetOwnedDomains(solanaKit),
    new SolanaGetOwnedTldDomains(solanaKit),
    new SolanaGetAllTlds(solanaKit),
    new SolanaGetMainDomain(solanaKit),
    new SolanaResolveAllDomainsTool(solanaKit),
    new SolanaCreateGibworkTask(solanaKit),
    new SolanaRockPaperScissorsTool(solanaKit),
    new SolanaTipLinkTool(solanaKit),
    new SolanaListNFTForSaleTool(solanaKit),
    new SolanaCancelNFTListingTool(solanaKit),
    new SolanaCloseEmptyTokenAccounts(solanaKit),
    new SolanaFetchTokenReportSummaryTool(solanaKit),
    new SolanaFetchTokenDetailedReportTool(solanaKit),
    new Solana3LandCreateSingle(solanaKit),
    new Solana3LandCreateCollection(solanaKit),
    new SolanaPerpOpenTradeTool(solanaKit),
    new SolanaPerpCloseTradeTool(solanaKit),
    new SolanaFlashOpenTrade(solanaKit),
    new SolanaFlashCloseTrade(solanaKit),
    new Solana3LandCreateSingle(solanaKit),
  ];
}
