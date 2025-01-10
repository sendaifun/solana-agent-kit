import { SolanaAgentKit } from "../index";

import { SolanaBalanceTool } from "./Balance/SolanaBalanceTool";
import { SolanaBalanceOtherTool } from "./Balance/SolanaBalanceOtherTool";
import { SolanaTransferTool } from "./AgentTools/SolanaTransferTool";
import { SolanaDeployTokenTool } from "./Metaplex/SolanaDeployTokenTool";
import { SolanaDeployCollectionTool } from "./Metaplex/SolanaDeployCollectionTool";
import { SolanaPerpCloseTradeTool } from "./Adrena/SolanaPerpCloseTradeTool";
import { SolanaPerpOpenTradeTool } from "./Adrena/SolanaPerpOpenTradeTool";
import { SolanaTradeTool } from "./Jupiter/SolanaTradeTool";
import { SolanaLimitOrderTool } from "./Manifest/SolanaLimitOrderTool";
import { SolanaBatchOrderTool } from "./Manifest/SolanaBatchOrderTool";
import { SolanaCancelAllOrdersTool } from "./Manifest/SolanaCancelAllOrdersTool";
import { SolanaWithdrawAllTool } from "./Manifest/SolanaWithdrawAllTool";
import { SolanaRequestFundsTool } from "./AgentTools/SolanaRequestFundsTool";
import { SolanaRegisterDomainTool } from "./BonfidaNameService/SolanaRegisterDomainTool";
import { SolanaResolveDomainTool } from "./BonfidaNameService/SolanaResolveDomainTool";
import { SolanaGetDomainTool } from "./BonfidaNameService/SolanaGetDomainTool";
import { SolanaGetWalletAddressTool } from "./AgentTools/SolanaGetWalletAddressTool";
import { SolanaFlashOpenTrade } from "./FlashTrade/SolanaFlashOpenTrade";
import { SolanaFlashCloseTrade } from "./FlashTrade/SolanaFlashCloseTrade";
import { SolanaPumpfunTokenLaunchTool } from "./PumpFun/SolanaPumpfunTokenLaunchTool";
import { SolanaCreateImageTool } from "./Image/SolanaCreateImageTool";
import { SolanaLendAssetTool } from "./Lulo/SolanaLendAssetTool";
import { SolanaTPSCalculatorTool } from "./TPSCalculator/SolanaTPSCalculator";
import { SolanaStakeTool } from "./Jupiter/SolanaStakeTool";
import { SolanaRestakeTool } from "./Solayer/SolanaRestakeTool";
import { SolanaFetchPriceTool } from "./Jupiter/SolanaFetchPriceTool";
import { SolanaTokenDataTool } from "./Jupiter/SolanaTokenDataTool";
import { SolanaTokenDataByTickerTool } from "./DexScreener/SolanaTokenDataByTickerTool";
import { SolanaCompressedAirdropTool } from "./CompressedAirdrop/SolanaCompressedAirdropTool";
import { SolanaClosePosition } from "./Orca/SolanaClosePosition";
import { SolanaOrcaCreateCLMM } from "./Orca/SolanaOrcaCreateCLMM";
import { SolanaOrcaCreateSingleSideLiquidityPool } from "./Orca/SolanaOrcaCreateSingleSideLiquidtyPool";
import { SolanaOrcaFetchPositions } from "./Orca/SolanaOrcaFetchPosition";
import { SolanaOrcaOpenCenteredPosition } from "./Orca/SolanaOrcaOpenCenteredPosition";
import { SolanaOrcaOpenSingleSidedPosition } from "./Orca/SolanaOrcaOpenSingleSidedPosition";
import { SolanaRaydiumCreateAmmV4 } from "./Raydium/SolanaRaydiumCreateAmmV4";
import { SolanaRaydiumCreateClmm } from "./Raydium/SolanaRaydiumCreateClmm";
import { SolanaRaydiumCreateCpmm } from "./Raydium/SolanaRaydiumCreateCpmm";
import { SolanaOpenbookCreateMarket } from "./OpenBook/SolanaOpenbookCreateMarket";
import { SolanaManifestCreateMarket } from "./Manifest/SolanaMainfestCreateMarket";
import { SolanaPythFetchPrice } from "./Pyth/SolanaPythFetchPrice";
import { SolanaResolveAllDomainsTool } from "./TLDParser/SolanaResolveAllDomainsTool";
import { SolanaGetOwnedDomains } from "./TLDParser/SolanaGetOwnedDomains";
import { SolanaGetOwnedTldDomains } from "./TLDParser/SolanaGetOwnedTldDomains";
import { SolanaGetAllTlds } from "./TLDParser/SolanaGetAllTlds";
import { SolanaGetMainDomain } from "./BonfidaNameService/SolanaGetMainDomain";
import { SolanaCreateGibworkTask } from "./GibWork/SolanaCreateGibworkTask";
import { SolanaRockPaperScissorsTool } from "./RockPaperScissors/SolanaRockPaperScissorsTool";
import { SolanaTipLinkTool } from "./TipLink/SolanaTipLinkTool";
import { SolanaListNFTForSaleTool } from "./Tensor/SolanaListNFTForSaleTool";
import { SolanaCancelNFTListingTool } from "./Tensor/SolanaCancelNFTListingTool";
import { SolanaFetchTokenReportSummaryTool } from "./RugCheck/SolanaFetchTokenReportSummaryTool";
import { SolanaFetchTokenDetailedReportTool } from "./RugCheck/SolanaFetchTokenDetailedReportTool";
import { Solana3LandCreateSingle } from "./3Land/Solana3LandCreateSingle";
import { Solana3LandCreateCollection } from "./3Land/Solana3LandCreateCollection";
import { SolanaCloseEmptyTokenAccounts } from "./AgentTools/SolanaCloseEmptyTokenAccounts";
import { SolanaMintNFTTool } from "./Metaplex/SolanaMintNftTool";

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
