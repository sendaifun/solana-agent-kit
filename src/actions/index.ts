import tokenBalancesAction from "./tokenBalances";
import deployTokenAction from "./metaplex/deployToken";
import balanceAction from "./solana/balance";
import transferAction from "./solana/transfer";
import deployCollectionAction from "./metaplex/deployCollection";
import mintNFTAction from "./metaplex/mintNFT";
import tradeAction from "./jupiter/trade";
import requestFundsAction from "./solana/requestFunds";
import resolveDomainAction from "./sns/registerDomain";
import getTokenDataAction from "./jupiter/getTokenData";
import getTPSAction from "./solana/getTPS";
import fetchPriceAction from "./jupiter/fetchPrice";
import stakeWithJupAction from "./jupiter/stakeWithJup";
import stakeWithSolayerAction from "./solayer/stakeWithSolayer";
import registerDomainAction from "./sns/registerDomain";
import lendAssetAction from "./lulo/lendAsset";
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

export const ACTIONS = {
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
  TOKEN_BALANCES_ACTION: tokenBalancesAction,
  DEPLOY_TOKEN_ACTION: deployTokenAction,
  BALANCE_ACTION: balanceAction,
  TRANSFER_ACTION: transferAction,
  DEPLOY_COLLECTION_ACTION: deployCollectionAction,
  MINT_NFT_ACTION: mintNFTAction,
  TRADE_ACTION: tradeAction,
  REQUEST_FUNDS_ACTION: requestFundsAction,
  RESOLVE_DOMAIN_ACTION: resolveDomainAction,
  GET_TOKEN_DATA_ACTION: getTokenDataAction,
  GET_TPS_ACTION: getTPSAction,
  FETCH_PRICE_ACTION: fetchPriceAction,
  STAKE_WITH_JUP_ACTION: stakeWithJupAction,
  STAKE_WITH_SOLAYER_ACTION: stakeWithSolayerAction,
  REGISTER_DOMAIN_ACTION: registerDomainAction,
  LEND_ASSET_ACTION: lendAssetAction,
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
  LAUNCH_PUMPFUN_TOKEN_ACTION: launchPumpfunTokenAction,
  FLASH_OPEN_TRADE_ACTION: flashOpenTradeAction,
  FLASH_CLOSE_TRADE_ACTION: flashCloseTradeAction,
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
};

export type { Action, ActionExample, Handler } from "../types/action";
