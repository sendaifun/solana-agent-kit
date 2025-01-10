import { SolanaAgentKit } from "../index";
import { Solana3LandCreateCollection } from "./3land/solana_3land_create_collection_tool";
import { Solana3LandCreateSingle } from "./3land/solana_3land_create_single_tool";
import { SolanaGetAllTlds } from "./AllDomains/solana_get_all_tlds_tool";
import { SolanaGetDomainTool } from "./AllDomains/solana_get_domain_tool";
import { SolanaGetMainDomain } from "./AllDomains/solana_get_main_domain_tool";
import { SolanaGetOwnedDomains } from "./AllDomains/solana_get_owned_domains_tool";
import { SolanaGetOwnedTldDomains } from "./AllDomains/solana_get_owned_tld_domains_tool";
import { SolanaRegisterDomainTool } from "./AllDomains/solana_register_domain_tool";
import { SolanaResolveAllDomainsTool } from "./AllDomains/solana_resolve_all_domains_tool";
import { SolanaResolveDomainTool } from "./AllDomains/solana_resolve_domain_tool";
import { SolanaFlashCloseTrade } from "./FlashTrade/solana_flash_close_trade";
import { SolanaFlashOpenTrade } from "./FlashTrade/solana_flash_open_trade";
import { SolanaCreateGibworkTask } from "./Gibwork/solana_create_gibwork_task_tool";
import { SolanaFetchPriceTool } from "./Jupiter/solana_fetch_price_tool";
import { SolanaStakeTool } from "./Jupiter/solana_stake_tool";
import { SolanaTokenDataByTickerTool } from "./Jupiter/solana_token_data_by_ticker_tool";
import { SolanaTokenDataTool } from "./Jupiter/solana_token_data_tool";
import { SolanaTradeTool } from "./Jupiter/solana_trade_tool";
import { SolanaLendAssetTool } from "./Lulo/solana_lend_asset_tool";
import { SolanaBatchOrderTool } from "./Manifest/solana_batch_order_tool";
import { SolanaCancelAllOrdersTool } from "./Manifest/solana_cancel_all_orders_tool";
import { SolanaLimitOrderTool } from "./Manifest/solana_limit_order_tool";
import { SolanaManifestCreateMarket } from "./Manifest/solana_manifest_create_market_tool";
import { SolanaWithdrawAllTool } from "./Manifest/solana_withdraw_all_tool";
import { SolanaCreateImageTool } from "./Metaplex/solana_create_image_tool";
import { SolanaDeployCollectionTool } from "./Metaplex/solana_deploy_collection_tool";
import { SolanaDeployTokenTool } from "./Metaplex/solana_deploy_token_tool";
import { SolanaMintNFTTool } from "./Metaplex/solana_mint_nft_tool";
import { SolanaOpenbookCreateMarket } from "./Openbook/solana_openbook_create_market_tool";
import { SolanaClosePosition } from "./Orca/solana_close_position_tool";
import { SolanaOrcaCreateCLMM } from "./Orca/solana_orca_create_clmm_tool";
import { SolanaOrcaCreateSingleSideLiquidityPool } from "./Orca/solana_orca_create_single_side_liquidity_pool";
import { SolanaOrcaFetchPositions } from "./Orca/solana_orca_fetch_positions_tool";
import { SolanaOrcaOpenCenteredPosition } from "./Orca/solana_orca_open_centered_position_tool";
import { SolanaOrcaOpenSingleSidedPosition } from "./Orca/solana_orca_open_single_sided_position_tool";
import { SolanaPerpCloseTradeTool } from "./Perp/solana_perp_close_trade_tool";
import { SolanaPerpOpenTradeTool } from "./Perp/solana_perp_open_trade_tool";
import { SolanaPumpfunTokenLaunchTool } from "./Pumpfun/solana_pumpfun_token_launch_tool";
import { SolanaPythFetchPrice } from "./Pyth/solana_pyth_fetch_price_tool";
import { SolanaRaydiumCreateAmmV4 } from "./Raydium/solana_raydium_create_amm_v4_tool";
import { SolanaRaydiumCreateClmm } from "./Raydium/solana_raydium_create_clmm_tool";
import { SolanaRaydiumCreateCpmm } from "./Raydium/solana_raydium_create_cpmm_tool";
import { SolanaFetchTokenDetailedReportTool } from "./RugCheck/solana_fetch_token_detailed_report_tool";
import { SolanaFetchTokenReportSummaryTool } from "./RugCheck/solana_fetch_token_report_summary_tool";
import { SolanaRockPaperScissorsTool } from "./Sendarcade/solana_rock_paper_scissors_tool";
import { SolanaBalanceOtherTool } from "./Solana/solana_balance_other_tool";
import { SolanaBalanceTool } from "./Solana/solana_balance_tool";
import { SolanaCloseEmptyTokenAccounts } from "./Solana/solana_close_empty_token_accounts_tool";
import { SolanaCompressedAirdropTool } from "./Solana/solana_compressed_airdrop_tool";
import { SolanaGetWalletAddressTool } from "./Solana/solana_get_wallet_adress_tool";
import { SolanaRequestFundsTool } from "./Solana/solana_request_funds_tool";
import { SolanaTPSCalculatorTool } from "./Solana/solana_tps_calculator_tool";
import { SolanaTransferTool } from "./Solana/solana_transfer_tool";
import { SolanaRestakeTool } from "./Solayer/solana_restake_tool";
import { SolanaCancelNFTListingTool } from "./Tensor/solana_cancel_nft_listing_tool";
import { SolanaListNFTForSaleTool } from "./Tensor/solana_list_nft_for_sale_tool";
import { SolanaTipLinkTool } from "./TipLink/solana_tip_link_tool";

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
