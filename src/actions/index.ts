import tokenBalancesAction from "./tokenBalances";
import deployTokenAction from "./metaplex/deployToken";
import deployToken2022Action from "./metaplex/deployToken2022";
import balanceAction from "./solana/balance";
import transferAction from "./solana/transfer";
import deployCollectionAction from "./metaplex/deployCollection";
import mintNFTAction from "./metaplex/mintNFT";
import tradeAction from "./jupiter/trade";
import requestFundsAction from "./solana/requestFunds";
import getTokenDataAction from "./jupiter/getTokenData";
import getTPSAction from "./solana/getTPS";
import fetchPriceAction from "./jupiter/fetchPrice";
import stakeWithJupAction from "./jupiter/stakeWithJup";
import stakeWithSolayerAction from "./solayer/stakeWithSolayer";
import registerDomainAction from "./sns/registerDomain";
import lendAssetAction from "./lulo/lendAsset";
import luloLendAction from "./lulo/luloLend";
import luloWithdrawAction from "./lulo/luloWithdraw";
import createGibworkTaskAction from "./gibwork/createGibworkTask";
import resolveSolDomainAction from "./sns/resolveSolDomain";
import pythFetchPriceAction from "./pyth/pythFetchPrice";
import getOwnedDomainsForTLDAction from "./alldomains/getOwnedDomainsForTLD";
import getPrimaryDomainAction from "./sns/getPrimaryDomain";
import getAllDomainsTLDsAction from "./alldomains/getAllDomainsTLDs";
import getOwnedAllDomainsAction from "./alldomains/getOwnedAllDomains";
import createImageAction from "./agent/createImage";
import getMainAllDomainsDomainAction from "./sns/getMainAllDomainsDomain";
import getAllRegisteredAllDomainsAction from "./sns/getAllRegisteredAllDomains";
import raydiumCreateCpmmAction from "./raydium/raydiumCreateCpmm";
import raydiumCreateAmmV4Action from "./raydium/raydiumCreateAmmV4";
import createOrcaSingleSidedWhirlpoolAction from "./orca/createOrcaSingleSidedWhirlpool";
import launchPumpfunTokenAction from "./pumpfun/launchPumpfunToken";
import getWalletAddressAction from "./agent/getWalletAddress";
import flashOpenTradeAction from "./flash/flashOpenTrade";
import flashCloseTradeAction from "./flash/flashCloseTrade";
import fluxbeamCreatePoolAction from "./fluxbeam/createPool";
import createMultisigAction from "./squads/createMultisig";
import approveMultisigProposalAction from "./squads/approveMultisigProposal";
import createMultisigProposalAction from "./squads/createMultisigProposal";
import depositToMultisigAction from "./squads/depositToMultisigTreasury";
import executeMultisigProposalAction from "./squads/executeMultisigProposal";
import rejectMultisigProposalAction from "./squads/rejectMultisigProposal";
import transferFromMultisigAction from "./squads/transferFromMultisigTreasury";
import createWebhookAction from "./helius/createWebhook";
import deleteWebhookAction from "./helius/deleteWebhook";
import getAssetsByOwnerAction from "./helius/getAssetsbyOwner";
import getWebhookAction from "./helius/getWebhook";
import parseSolanaTransactionAction from "./helius/parseTransaction";
import sendTransactionWithPriorityFeeAction from "./helius/sendTransactionWithPriority";
import createDriftVaultAction from "./drift/createVault";
import updateDriftVaultAction from "./drift/updateVault";
import depositIntoDriftVaultAction from "./drift/depositIntoVault";
import requestWithdrawalFromVaultAction from "./drift/requestWithdrawalFromVault";
import withdrawFromVaultAction from "./drift/withdrawFromVault";
import tradeDelegatedDriftVaultAction from "./drift/tradeDelegatedDriftVault";
import vaultInfoAction from "./drift/vaultInfo";
import createDriftUserAccountAction from "./drift/createDriftUserAccount";
import tradeDriftPerpAccountAction from "./drift/tradePerpAccount";
import doesUserHaveDriftAccountAction from "./drift/doesUserHaveDriftAccount";
import depositToDriftUserAccountAction from "./drift/depositToDriftUserAccount";
import withdrawFromDriftAccountAction from "./drift/withdrawFromDriftAccount";
import driftUserAccountInfoAction from "./drift/driftUserAccountInfo";
import deriveDriftVaultAddressAction from "./drift/deriveVaultAddress";
import updateDriftVaultDelegateAction from "./drift/updateDriftVaultDelegate";
import availableDriftMarketsAction from "./drift/availableMarkets";
import stakeToDriftInsuranceFundAction from "./drift/stakeToDriftInsuranceFund";
import requestUnstakeFromDriftInsuranceFundAction from "./drift/requestUnstakeFromDriftInsuranceFund";
import unstakeFromDriftInsuranceFundAction from "./drift/unstakeFromDriftInsuranceFund";
import driftSpotTokenSwapAction from "./drift/swapSpotToken";
import perpMarktetFundingRateAction from "./drift/perpMarketFundingRate";
import entryQuoteOfPerpTradeAction from "./drift/entryQuoteOfPerpTrade";
import lendAndBorrowAPYAction from "./drift/getLendAndBorrowAPY";
import getVoltrPositionValuesAction from "./voltr/getPositionValues";
import depositVoltrStrategyAction from "./voltr/depositStrategy";
import withdrawVoltrStrategyAction from "./voltr/withdrawStrategy";
import getAssetAction from "./metaplex/getAsset";
import getAssetsByAuthorityAction from "./metaplex/getAssetsByAuthority";
import getAssetsByCreatorAction from "./metaplex/getAssetsByCreator";
import getInfoAction from "./agent/get_info";
import switchboardSimulateFeedAction from "./switchboard/simulate_feed";
import swapAction from "./mayan/swap";
import getPriceInferenceAction from "./allora/getPriceInference";
import getAllTopicsAction from "./allora/getAllTopics";
import getInferenceByTopicIdAction from "./allora/getInferenceByTopicId";
import closeAccountsAction from "./solutiofi/closeAccounts";
import burnTokensAction from "./solutiofi/burnTokens";
import mergeTokensAction from "./solutiofi/mergeTokens";
import spreadTokenAction from "./solutiofi/spreadToken";
import closeOrcaPositionAction from "./orca/closeOrcaPosition";
import createOrcaCLMMAction from "./orca/createOrcaCLMM";
import fetchOrcaPositionsAction from "./orca/fetchOrcaPositions";
import openOrcaCenteredPositionWithLiquidityAction from "./orca/openOrcaCenteredPositionWithLiquidity";
import openOrcaSingleSidedPositionAction from "./orca/openOrcaSingleSidedPosition";
import { elfaPingAction } from "./elfa_ai/elfa_ai_actions";
import { elfaApiKeyStatusAction } from "./elfa_ai/elfa_ai_actions";
import { elfaGetSmartMentionsAction } from "./elfa_ai/elfa_ai_actions";
import { elfaGetTopMentionsByTickerAction } from "./elfa_ai/elfa_ai_actions";
import { elfaSearchMentionsByKeywordsAction } from "./elfa_ai/elfa_ai_actions";
import { elfaTrendingTokensAction } from "./elfa_ai/elfa_ai_actions";
import { elfaSmartTwitterAccountStats } from "./elfa_ai/elfa_ai_actions";
import getDebridgeSupportedChainsAction from "./debridge/getSupportedChains";
import getDebridgeTokensInfoAction from "./debridge/getTokensInfo";
import createDebridgeBridgeOrderAction from "./debridge/createBridgeOrder";
import executeDebridgeBridgeOrderAction from "./debridge/executeBridgeOrder";
import checkDebridgeTransactionStatusAction from "./debridge/checkTransactionStatus";
import getCoingeckoLatestPoolsActions from "./coingecko/getCoingeckoLatestPools";
import getCoingeckoTokenInfoAction from "./coingecko/getCoingeckoTokenInfo";
import getCoingeckoTokenPriceDataAction from "./coingecko/getCoingeckoTokenPriceData";
import getCoingeckoTopGainersAction from "./coingecko/getCoingeckoTopGainers";
import getCoingeckoTrendingPoolsAction from "./coingecko/getCoingeckoTrendingPools";
import getCoingeckoTrendingTokensAction from "./coingecko/getCoingeckoTrendingTokens";
import okxDexQuoteAction from "./okx-dex/quote_action";
import okxDexLiquidityAction from "./okx-dex/liquidity_action";
import okxDexSwapAction from "./okx-dex/swap_action";
import okxDexTokensAction from "./okx-dex/tokens_action";
import okxDexChainDataAction from "./okx-dex/chain_data_action";
import getWormholeSupportedChainsAction from "./wormhole/getSupportedChains";
import cctpTransferAction from "./wormhole/cctpTransfer";
import createWrappedTokenAction from "./wormhole/createWrappedToken";
import tokenTransferAction from "./wormhole/tokenTransfer";
import getLimitOrderHistoryAction from "./jupiter/getLimitOrderHistory";
import createLimitOrderAction from "./jupiter/createLimitOrder";
import cancelLimitOrdersAction from "./jupiter/cancelLimitOrders";
import getOpenLimitOrdersAction from "./jupiter/getOpenLimitOrders";

export const ACTIONS = {
  GET_INFO_ACTION: getInfoAction,
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
  TOKEN_BALANCES_ACTION: tokenBalancesAction,
  DEPLOY_TOKEN_ACTION: deployTokenAction,
  DEPLOY_TOKEN2022_ACTION: deployToken2022Action,
  BALANCE_ACTION: balanceAction,
  TRANSFER_ACTION: transferAction,
  DEPLOY_COLLECTION_ACTION: deployCollectionAction,
  MINT_NFT_ACTION: mintNFTAction,
  TRADE_ACTION: tradeAction,
  REQUEST_FUNDS_ACTION: requestFundsAction,
  GET_TOKEN_DATA_ACTION: getTokenDataAction,
  GET_TPS_ACTION: getTPSAction,
  FETCH_PRICE_ACTION: fetchPriceAction,
  STAKE_WITH_JUP_ACTION: stakeWithJupAction,
  STAKE_WITH_SOLAYER_ACTION: stakeWithSolayerAction,
  REGISTER_DOMAIN_ACTION: registerDomainAction,
  LEND_ASSET_ACTION: lendAssetAction,
  LULO_LEND_ACTION: luloLendAction,
  LULO_WITHDRAW_ACTION: luloWithdrawAction,
  CREATE_GIBWORK_TASK_ACTION: createGibworkTaskAction,
  RESOLVE_SOL_DOMAIN_ACTION: resolveSolDomainAction,
  PYTH_FETCH_PRICE_ACTION: pythFetchPriceAction,
  GET_OWNED_DOMAINS_FOR_TLD_ACTION: getOwnedDomainsForTLDAction,
  GET_PRIMARY_DOMAIN_ACTION: getPrimaryDomainAction,
  GET_ALL_DOMAINS_TLDS_ACTION: getAllDomainsTLDsAction,
  GET_OWNED_ALL_DOMAINS_ACTION: getOwnedAllDomainsAction,
  CREATE_IMAGE_ACTION: createImageAction,
  GET_MAIN_ALL_DOMAINS_DOMAIN_ACTION: getMainAllDomainsDomainAction,
  GET_ALL_REGISTERED_ALL_DOMAINS_ACTION: getAllRegisteredAllDomainsAction,
  RAYDIUM_CREATE_CPMM_ACTION: raydiumCreateCpmmAction,
  RAYDIUM_CREATE_AMM_V4_ACTION: raydiumCreateAmmV4Action,
  CREATE_ORCA_SINGLE_SIDED_WHIRLPOOL_ACTION:
    createOrcaSingleSidedWhirlpoolAction,
  CLOSE_ORCA_POSITION_ACTION: closeOrcaPositionAction,
  CREATE_ORCA_CLMM_ACTION: createOrcaCLMMAction,
  FETCH_ORCA_POSITIONS_ACTION: fetchOrcaPositionsAction,
  OPEN_ORCA_CENTERED_POSITION_WITH_LIQUIDITY_ACTION:
    openOrcaCenteredPositionWithLiquidityAction,
  OPEN_ORCA_SINGLE_SIDED_POSITION_ACTION: openOrcaSingleSidedPositionAction,
  LAUNCH_PUMPFUN_TOKEN_ACTION: launchPumpfunTokenAction,
  FLASH_OPEN_TRADE_ACTION: flashOpenTradeAction,
  FLASH_CLOSE_TRADE_ACTION: flashCloseTradeAction,
  FLUXBEAM_CREATE_POOL_ACTION: fluxbeamCreatePoolAction,
  CREATE_MULTISIG_ACTION: createMultisigAction,
  DEPOSIT_TO_MULTISIG_ACTION: depositToMultisigAction,
  TRANSFER_FROM_MULTISIG_ACTION: transferFromMultisigAction,
  CREATE_MULTISIG_PROPOSAL_ACTION: createMultisigProposalAction,
  APPROVE_MULTISIG_PROPOSAL_ACTION: approveMultisigProposalAction,
  REJECT_MULTISIG_PROPOSAL_ACTION: rejectMultisigProposalAction,
  EXECUTE_MULTISIG_PROPOSAL_ACTION: executeMultisigProposalAction,
  CREATE_WEBHOOK_ACTION: createWebhookAction,
  DELETE_WEBHOOK_ACTION: deleteWebhookAction,
  GET_ASSETS_BY_OWNER_ACTION: getAssetsByOwnerAction,
  GET_WEBHOOK_ACTION: getWebhookAction,
  PARSE_TRANSACTION_ACTION: parseSolanaTransactionAction,
  SEND_TRANSACTION_WITH_PRIORITY_ACTION: sendTransactionWithPriorityFeeAction,
  CREATE_DRIFT_VAULT_ACTION: createDriftVaultAction,
  UPDATE_DRIFT_VAULT_ACTION: updateDriftVaultAction,
  DEPOSIT_INTO_DRIFT_VAULT_ACTION: depositIntoDriftVaultAction,
  REQUEST_WITHDRAWAL_FROM_DRIFT_VAULT_ACTION: requestWithdrawalFromVaultAction,
  WITHDRAW_FROM_DRIFT_VAULT_ACTION: withdrawFromVaultAction,
  TRADE_DELEGATED_DRIFT_VAULT_ACTION: tradeDelegatedDriftVaultAction,
  DRIFT_VAULT_INFO_ACTION: vaultInfoAction,
  CREATE_DRIFT_USER_ACCOUNT_ACTION: createDriftUserAccountAction,
  TRADE_DRIFT_PERP_ACCOUNT_ACTION: tradeDriftPerpAccountAction,
  DOES_USER_HAVE_DRIFT_ACCOUNT_ACTION: doesUserHaveDriftAccountAction,
  DEPOSIT_TO_DRIFT_USER_ACCOUNT_ACTION: depositToDriftUserAccountAction,
  WITHDRAW_OR_BORROW_FROM_DRIFT_ACCOUNT_ACTION: withdrawFromDriftAccountAction,
  DRIFT_USER_ACCOUNT_INFO_ACTION: driftUserAccountInfoAction,
  DERIVE_DRIFT_VAULT_ADDRESS_ACTION: deriveDriftVaultAddressAction,
  UPDATE_DRIFT_VAULT_DELEGATE_ACTION: updateDriftVaultDelegateAction,
  AVAILABLE_DRIFT_MARKETS_ACTION: availableDriftMarketsAction,
  STAKE_TO_DRIFT_INSURANCE_FUND_ACTION: stakeToDriftInsuranceFundAction,
  REQUEST_UNSTAKE_FROM_DRIFT_INSURANCE_FUND_ACTION:
    requestUnstakeFromDriftInsuranceFundAction,
  UNSTAKE_FROM_DRIFT_INSURANCE_FUND_ACTION: unstakeFromDriftInsuranceFundAction,
  DRIFT_SPOT_TOKEN_SWAP_ACTION: driftSpotTokenSwapAction,
  DRIFT_PERP_MARKET_FUNDING_RATE_ACTION: perpMarktetFundingRateAction,
  DRIFT_GET_ENTRY_QUOTE_OF_PERP_TRADE_ACTION: entryQuoteOfPerpTradeAction,
  DRIFT_GET_LEND_AND_BORROW_APY_ACTION: lendAndBorrowAPYAction,
  GET_VOLTR_POSITION_VALUES_ACTION: getVoltrPositionValuesAction,
  DEPOSIT_VOLTR_STRATEGY_ACTION: depositVoltrStrategyAction,
  WITHDRAW_VOLTR_STRATEGY_ACTION: withdrawVoltrStrategyAction,
  GET_ASSET_ACTION: getAssetAction,
  GET_ASSETS_BY_AUTHORITY_ACTION: getAssetsByAuthorityAction,
  SWITCHBOARD_FEED_ACTION: switchboardSimulateFeedAction,
  GET_ASSETS_BY_CREATOR_ACTION: getAssetsByCreatorAction,
  SWAP_ACTION: swapAction,
  GET_PRICE_INFERENCE_ACTION: getPriceInferenceAction,
  GET_ALL_TOPICS_ACTION: getAllTopicsAction,
  GET_INFERENCE_BY_TOPIC_ID_ACTION: getInferenceByTopicIdAction,
  ELFA_PING_ACTION: elfaPingAction,
  ELFA_API_KEY_STATUS_ACTION: elfaApiKeyStatusAction,
  ELFA_GET_SMART_MENTIONS_ACTION: elfaGetSmartMentionsAction,
  ELFA_GET_TOP_MENTIONS_BY_TICKER_ACTION: elfaGetTopMentionsByTickerAction,
  ELFA_SEARCH_MENTIONS_BY_KEYWORDS_ACTION: elfaSearchMentionsByKeywordsAction,
  ELFA_TRENDING_TOKENS_ACTION: elfaTrendingTokensAction,
  ELFA_SMART_TWITTER_ACCOUNT_STATS_ACTION: elfaSmartTwitterAccountStats,
  DEBRIDGE_GET_SUPPORTED_CHAINS_ACTION: getDebridgeSupportedChainsAction,
  DEBRIDGE_GET_TOKENS_INFO_ACTION: getDebridgeTokensInfoAction,
  DEBRIDGE_CREATE_BRIDGE_ORDER_ACTION: createDebridgeBridgeOrderAction,
  DEBRIDGE_CHECK_TRANSACTION_STATUS_ACTION:
    checkDebridgeTransactionStatusAction,
  DEBRIDGE_EXECUTE_BRIDGE_ORDER_ACTION: executeDebridgeBridgeOrderAction,
  SOLUTIOFI_CLOSE_ACCOUNTS_ACTION: closeAccountsAction,
  SOLUTIOFI_BURN_TOKENS_ACTION: burnTokensAction,
  SOLUTIOFI_MERGE_TOKENS_ACTION: mergeTokensAction,
  SOLUTIOFI_SPREAD_TOKEN_ACTION: spreadTokenAction,
  GET_COINGECKO_LATEST_POOLS_ACTION: getCoingeckoLatestPoolsActions,
  GET_COINGECKO_TOKEN_INFO_ACTION: getCoingeckoTokenInfoAction,
  GET_COINGECKO_TOKEN_PRICE_DATA_ACTION: getCoingeckoTokenPriceDataAction,
  GET_COINGECKO_TOP_GAINERS_ACTION: getCoingeckoTopGainersAction,
  GET_COINGECKO_TRENDING_POOLS_ACTION: getCoingeckoTrendingPoolsAction,
  GET_COINGECKO_TRENDING_TOKENS_ACTION: getCoingeckoTrendingTokensAction,
  OKX_DEX_QUOTE_ACTION: okxDexQuoteAction,
  OKX_DEX_LIQUIDITY_ACTION: okxDexLiquidityAction,
  OKX_DEX_CHAIN_DATA_ACTION: okxDexChainDataAction,
  OKX_DEX_SWAP_ACTION: okxDexSwapAction,
  OKX_DEX_TOKENS_ACTION: okxDexTokensAction,
  GET_WORMHOLE_SUPPORTED_CHAINS_ACTION: getWormholeSupportedChainsAction,
  CCTP_TRANSFER_ACTION: cctpTransferAction,
  CREATE_WRAPPED_TOKEN_ACTION: createWrappedTokenAction,
  TOKEN_TRANSFER_ACTION: tokenTransferAction,
  CREATE_LIMIT_ORDER_ACTION: createLimitOrderAction,
  CANCEL_LIMIT_ORDERS_ACTION: cancelLimitOrdersAction,
  GET_LIMIT_ORDER_HISTORY_ACTION: getLimitOrderHistoryAction,
  GET_OPEN_LIMIT_ORDERS_ACTION: getOpenLimitOrdersAction,
};

export type { Action, ActionExample, Handler } from "../types/action";
