import { SolanaAgentKit } from "../index";
import {
  SolanaBalanceOtherTool,
  SolanaBalanceTool,
  SolanaRequestFundsTool,
  SolanaTPSCalculatorTool,
  SolanaTransferTool,
} from "./solana_native";
import { Solana3LandCreateSingle, Solana3LandCreateCollection } from "./3land";
import { SolanaPerpOpenTradeTool, SolanaPerpCloseTradeTool } from "./adrena";
import {
  SolanaGetWalletAddressTool,
  SolanaCreateImageTool,
  SolanaCloseEmptyTokenAccounts,
} from "./agent";
import {
  SolanaRegisterDomainTool,
  SolanaGetDomainTool,
  SolanaResolveDomainTool,
  SolanaGetMainDomain,
} from "./bonfida";
import { SolanaFlashOpenTrade, SolanaFlashCloseTrade } from "./flash";
import { SolanaCreateGibworkTask } from "./gibwork";
import {
  SolanaTradeTool,
  SolanaStakeTool,
  SolanaFetchPriceTool,
  SolanaTokenDataTool,
  SolanaTokenDataByTickerTool,
} from "./jupiter";
import { SolanaCompressedAirdropTool } from "./light_protocol";
import { SolanaLendAssetTool } from "./lulo";
import {
  SolanaManifestCreateMarket,
  SolanaLimitOrderTool,
  SolanaBatchOrderTool,
  SolanaCancelAllOrdersTool,
  SolanaWithdrawAllTool,
} from "./manifest";
import {
  SolanaDeployTokenTool,
  SolanaDeployCollectionTool,
  SolanaMintNFTTool,
} from "./metaplex";
import {
  SolanaGetOwnedDomains,
  SolanaGetOwnedTldDomains,
  SolanaGetAllTlds,
  SolanaResolveAllDomainsTool,
} from "./onsol_labs";
import {
  SolanaClosePosition,
  SolanaOrcaCreateCLMM,
  SolanaOrcaCreateSingleSideLiquidityPool,
  SolanaOrcaFetchPositions,
  SolanaOrcaOpenCenteredPosition,
  SolanaOrcaOpenSingleSidedPosition,
} from "./orca";
import { SolanaPumpfunTokenLaunchTool } from "./pumpfun";
import { SolanaPythFetchPrice } from "./pyth";
import {
  SolanaRaydiumCreateAmmV4,
  SolanaRaydiumCreateClmm,
  SolanaRaydiumCreateCpmm,
  SolanaOpenbookCreateMarket,
} from "./raydium";
import {
  SolanaFetchTokenReportSummaryTool,
  SolanaFetchTokenDetailedReportTool,
} from "./rugcheck";
import { SolanaRockPaperScissorsTool } from "./send_arcade";
import { SolanaRestakeTool } from "./solayer";
import {
  SolanaCreate2by2Multisig,
  SolanaDepositTo2by2Multisig,
  SolanaTransferFrom2by2Multisig,
  SolanaCreateProposal2by2Multisig,
  SolanaApproveProposal2by2Multisig,
  SolanaRejectProposal2by2Multisig,
  SolanaExecuteProposal2by2Multisig,
} from "./squads";
import { SolanaListNFTForSaleTool, SolanaCancelNFTListingTool } from "./tensor";
import { SolanaTipLinkTool } from "./tiplink";

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
    new SolanaCreate2by2Multisig(solanaKit),
    new SolanaDepositTo2by2Multisig(solanaKit),
    new SolanaTransferFrom2by2Multisig(solanaKit),
    new SolanaCreateProposal2by2Multisig(solanaKit),
    new SolanaApproveProposal2by2Multisig(solanaKit),
    new SolanaRejectProposal2by2Multisig(solanaKit),
    new SolanaExecuteProposal2by2Multisig(solanaKit),
  ];
}
