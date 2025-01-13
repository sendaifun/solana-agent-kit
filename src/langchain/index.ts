export * from "./adrena";
export * from "./alldomains";
export * from "./dexscreener";
export * from "./alldomains";
export * from "./flash";
export * from "./gibwork";
export * from "./jupiter";
export * from "./lulo";
export * from "./manifest";
export * from "./solana";
export * from "./agent";
export * from "./metaplex";
export * from "./openbook";
export * from "./orca";
export * from "./pumpfun";
export * from "./pyth";
export * from "./raydium";
export * from "./rugcheck";
export * from "./sendarcade";
export * from "./solayer";
export * from "./tensor";
export * from "./3land";
export * from "./tiplink";
export * from "./sns";
export * from "./lightprotocol";
export * from "./squads";

import { SolanaAgentKit } from "../agent";
import {
  SolanaBalanceTool,
  SolanaBalanceOtherTool,
  SolanaTransferTool,
  SolanaDeployTokenTool,
  SolanaDeployCollectionTool,
  SolanaMintNFTTool,
  SolanaTradeTool,
  SolanaRequestFundsTool,
  SolanaRegisterDomainTool,
  SolanaGetWalletAddressTool,
  SolanaPumpfunTokenLaunchTool,
  SolanaCreateImageTool,
  SolanaLendAssetTool,
  SolanaTPSCalculatorTool,
  SolanaStakeTool,
  SolanaRestakeTool,
  SolanaFetchPriceTool,
  SolanaGetDomainTool,
  SolanaTokenDataTool,
  SolanaTokenDataByTickerTool,
  SolanaCompressedAirdropTool,
  SolanaRaydiumCreateAmmV4,
  SolanaRaydiumCreateClmm,
  SolanaRaydiumCreateCpmm,
  SolanaOpenbookCreateMarket,
  SolanaManifestCreateMarket,
  SolanaLimitOrderTool,
  SolanaBatchOrderTool,
  SolanaCancelAllOrdersTool,
  SolanaWithdrawAllTool,
  SolanaClosePosition,
  SolanaOrcaCreateCLMM,
  SolanaOrcaCreateSingleSideLiquidityPool,
  SolanaOrcaFetchPositions,
  SolanaOrcaOpenCenteredPosition,
  SolanaOrcaOpenSingleSidedPosition,
  SolanaPythFetchPrice,
  SolanaResolveDomainTool,
  SolanaGetOwnedDomains,
  SolanaGetOwnedTldDomains,
  SolanaGetAllTlds,
  SolanaGetMainDomain,
  SolanaResolveAllDomainsTool,
  SolanaCreateGibworkTask,
  SolanaRockPaperScissorsTool,
  SolanaTipLinkTool,
  SolanaListNFTForSaleTool,
  SolanaCancelNFTListingTool,
  SolanaCloseEmptyTokenAccounts,
  SolanaFetchTokenReportSummaryTool,
  SolanaFetchTokenDetailedReportTool,
  Solana3LandCreateSingle,
  Solana3LandCreateCollection,
  SolanaPerpOpenTradeTool,
  SolanaPerpCloseTradeTool,
  SolanaFlashOpenTrade,
  SolanaFlashCloseTrade,
  SolanaCreate2by2Multisig,
  SolanaDepositTo2by2Multisig,
  SolanaTransferFrom2by2Multisig,
  SolanaCreateProposal2by2Multisig,
  SolanaApproveProposal2by2Multisig,
  SolanaExecuteProposal2by2Multisig,
  SolanaRejectProposal2by2Multisig,
} from "./index";

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
    new SolanaCreate2by2Multisig(solanaKit),
    new SolanaCreateProposal2by2Multisig(solanaKit),
    new SolanaApproveProposal2by2Multisig(solanaKit),
    new SolanaRejectProposal2by2Multisig(solanaKit),
    new SolanaExecuteProposal2by2Multisig(solanaKit),
    new SolanaDepositTo2by2Multisig(solanaKit),
    new SolanaTransferFrom2by2Multisig(solanaKit),
  ];
}
