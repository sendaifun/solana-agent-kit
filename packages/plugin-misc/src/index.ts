import type { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import all actions
// alldomains
import getAllDomainsTLDsAction from "./alldomains/actions/getAllDomainsTLDs";
import getOwnedAllDomainsAction from "./alldomains/actions/getOwnedAllDomains";
import getOwnedDomainsForTLDAction from "./alldomains/actions/getOwnedDomainsForTLD";
import resolveDomainAction from "./alldomains/actions/resolveDomain";

// allora
import getAllTopicsAction from "./allora/actions/getAllTopics";
import getInferenceByTopicIdAction from "./allora/actions/getInferenceByTopicId";
import getPriceInferenceAction from "./allora/actions/getPriceInference";

// gibwork
import createGibworkTaskAction from "./gibwork/actions/createGibworkTask";

// helius
import createWebhookAction from "./helius/actions/createWebhook";
import deleteWebhookAction from "./helius/actions/deleteWebhook";
import getAssetsByOwnerAction from "./helius/actions/getAssetsbyOwner";
import getWebhookAction from "./helius/actions/getWebhook";
import parseSolanaTransactionAction from "./helius/actions/parseTransaction";

import getAllRegisteredAllDomainsAction from "./sns/actions/getAllRegisteredAllDomains";
import getMainAllDomainsDomainAction from "./sns/actions/getMainAllDomainsDomain";
import getPrimaryDomainAction from "./sns/actions/getPrimaryDomain";
import registerDomainAction from "./sns/actions/registerDomain";
// sns
import resolveSolDomainAction from "./sns/actions/resolveSolDomain";

import approveMultisigProposalAction from "./squads/actions/approveMultisigProposal";
import createMultisigAction from "./squads/actions/createMultisig";
import createMultisigProposalAction from "./squads/actions/createMultisigProposal";
import depositToMultisigTreasuryAction from "./squads/actions/depositToMultisigTreasury";
import executeMultisigProposalAction from "./squads/actions/executeMultisigProposal";
import rejectMultisigProposalAction from "./squads/actions/rejectMultisigProposal";
// squads
import transferFromMultisigTreasuryAction from "./squads/actions/transferFromMultisigTreasury";

// switchboard
import simulateFeedAction from "./switchboard/actions/simulateFeed";

// coingecko
import getCoingeckoLatestPoolsAction from "./coingecko/actions/getCoingeckoLatestPools";
import getCoingeckoTokenInfoAction from "./coingecko/actions/getCoingeckoTokenInfo";
import getCoingeckoTokenPriceDataAction from "./coingecko/actions/getCoingeckoTokenPriceData";
import getCoingeckoTopGainersAction from "./coingecko/actions/getCoingeckoTopGainers";
import getCoingeckoTrendingPoolsAction from "./coingecko/actions/getCoingeckoTrendingPools";
import getCoingeckoTrendingTokensAction from "./coingecko/actions/getCoingeckoTrendingTokens";

// elfa ai
import {
  elfaApiKeyStatusAction,
  elfaGetSmartMentionsAction,
  elfaGetTopMentionsByTickerAction,
  elfaPingAction,
  elfaSearchMentionsByKeywordsAction,
  elfaSmartTwitterAccountStats,
  elfaTrendingTokensAction,
} from "./elfaai/actions";

// solanafm
import parseAccountAction from "./solanafm/actions/parseAccount";
import parseInstructionAction from "./solanafm/actions/parseInstruction";

// messari
import getMessariAiAction from "./messari/actions/askMessariAi";

// Import all tools
import {
  getAllDomainsTLDs,
  getOwnedAllDomains,
  getOwnedDomainsForTLD,
  resolveAllDomains,
} from "./alldomains/tools";
import {
  getAllTopics,
  getInferenceByTopicId,
  getPriceInference,
} from "./allora/tools";
import {
  getLatestPools,
  getTokenInfo,
  getTokenPriceData,
  getTopGainers,
  getTrendingPools,
  getTrendingTokens,
} from "./coingecko/tools";
import {
  getElfaAiApiKeyStatus,
  getSmartMentions,
  getSmartTwitterAccountStats,
  getTopMentionsByTicker,
  getTrendingTokensUsingElfaAi,
  pingElfaAiApi,
  searchMentionsByKeywords,
} from "./elfaai/tools/elfa_ai_api";
import { createGibworkTask } from "./gibwork/tools";
import {
  create_HeliusWebhook,
  deleteHeliusWebhook,
  getAssetsByOwner,
  getHeliusWebhook,
  parseTransaction,
  sendTransactionWithPriorityFee,
} from "./helius/tools";
import { askMessariAi } from "./messari/tools";
import {
  getAllRegisteredAllDomains,
  getMainAllDomainsDomain,
  getPrimaryDomain,
  registerDomain,
  resolveSolDomain,
} from "./sns/tools";
import {
  parse_account as parseAccountUsingSolanaFM,
  parse_instruction as parseInstructionUsingSolanaFM,
} from "./solanafm/tools";
import {
  create_squads_multisig,
  multisig_approve_proposal,
  multisig_create_proposal,
  multisig_deposit_to_treasury,
  multisig_execute_proposal,
  multisig_reject_proposal,
  multisig_transfer_from_treasury,
} from "./squads/tools";
import { simulate_switchboard_feed } from "./switchboard/tools";

// crossmint
import checkoutAction from "./crossmint/actions/checkoutAction";
import confirmOrderAction from "./crossmint/actions/confirmOrderAction";
import checkout from "./crossmint/tools/checkout";
import confirmOrder from "./crossmint/tools/confirm-order";
import {
  fetch_oldest_tokens,
  fetch_recent_tokens,
  fetch_token_by_creator,
  fetch_token_by_initializer,
  fetch_token_by_mint,
  fetch_token_by_signature,
  fetch_tokens_by_creators,
  fetch_tokens_by_duration,
  fetch_tokens_by_initializers,
  fetch_tokens_by_market_cap,
  fetch_tokens_by_metadata,
  fetch_tokens_by_mints,
} from "./homomemetus/tools";
import fetchOldestTokensAction from "./homomemetus/actions/fetchOldestTokens";
import fetchRecentTokensAction from "./homomemetus/actions/fetchRecentTokens";
import fetchTokenByCreatorAction from "./homomemetus/actions/fetchTokenByCreator";
import fetchTokenByInitializerAction from "./homomemetus/actions/fetchTokenByInitializer";
import fetchTokenByMintAction from "./homomemetus/actions/fetchTokenByMint";
import fetchTokenBySignatureAction from "./homomemetus/actions/fetchTokenBySignature";
import fetchTokensByCreatorsAction from "./homomemetus/actions/fetchTokensByCreators";
import fetchTokensByDurationAction from "./homomemetus/actions/fetchTokensByDuration";
import fetchTokensByInitializersAction from "./homomemetus/actions/fetchTokensByInitializers";
import fetchTokensByMarketCapAction from "./homomemetus/actions/fetchTokensByMarketCap";
import fetchTokensByMetadataAction from "./homomemetus/actions/fetchTokensByMetadata";
import fetchTokensByMintsAction from "./homomemetus/actions/fetchTokensByMints";

import {
  create_verification_pda,
  decode_verification_pda_data,
  get_program_build_log,
  get_program_verification_status,
  get_verification_job_status,
  get_verified_programs,
  verify_program,
} from "./ottersec/tools";

import createVerificationPdaAction from "./ottersec/actions/createVerificationPda";
import decodeVerificationPdaDataAction from "./ottersec/actions/decodeVerificationPdaData";
import getProgramBuildLogAction from "./ottersec/actions/getProgramBuildLog";
import getProgramVerificationStatusAction from "./ottersec/actions/getProgramVerificationStatus";
import getVerificationJobStatusAction from "./ottersec/actions/getVerificationJobStatus";
import getVerifiedProgramsAction from "./ottersec/actions/getVerifiedPrograms";
import verifyProgramAction from "./ottersec/actions/verifyProgram";

// Define and export the plugin
const MiscPlugin = {
  name: "misc",

  // Combine all tools
  methods: {
    getAllDomainsTLDs,
    getOwnedAllDomains,
    getOwnedDomainsForTLD,
    resolveAllDomains,
    getAllTopics,
    getInferenceByTopicId,
    getPriceInference,
    createGibworkTask,
    create_HeliusWebhook,
    deleteHeliusWebhook,
    sendTransactionWithPriorityFee,
    getAssetsByOwner,
    getHeliusWebhook,
    parseTransaction,
    resolveSolDomain,
    registerDomain,
    getAllRegisteredAllDomains,
    getMainAllDomainsDomain,
    getPrimaryDomain,
    create_squads_multisig,
    multisig_create_proposal,
    multisig_approve_proposal,
    multisig_deposit_to_treasury,
    multisig_execute_proposal,
    multisig_reject_proposal,
    multisig_transfer_from_treasury,
    simulate_switchboard_feed,
    getCoingeckoTokenInfo: getTokenInfo,
    getCoingeckoTopGainers: getTopGainers,
    getCoingeckoLatestPools: getLatestPools,
    getCoingeckoTrendingPools: getTrendingPools,
    getCoingeckoTokenPriceData: getTokenPriceData,
    getCoingeckoTrendingTokens: getTrendingTokens,
    getElfaAiApiKeyStatus,
    getSmartMentionsUsingElfaAi: getSmartMentions,
    getSmartTwitterAccountStatsUsingElfaAi: getSmartTwitterAccountStats,
    getTopMentionsByTickerUsingElfaAi: getTopMentionsByTicker,
    getTrendingTokensUsingElfaAi,
    pingElfaAiApi,
    searchMentionsByKeywordsUsingElfaAi: searchMentionsByKeywords,
    parseAccountUsingSolanaFM,
    parseInstructionUsingSolanaFM,
    askMessariAi,
    checkout,
    confirmOrder,
    fetch_oldest_tokens,
    fetch_recent_tokens,
    fetch_token_by_creator,
    fetch_token_by_initializer,
    fetch_token_by_mint,
    fetch_token_by_signature,
    fetch_tokens_by_creators,
    fetch_tokens_by_duration,
    fetch_tokens_by_initializers,
    fetch_tokens_by_market_cap,
    fetch_tokens_by_metadata,
    fetch_tokens_by_mints,
    create_verification_pda,
    decode_verification_pda_data,
    get_program_build_log,
    get_program_verification_status,
    get_verification_job_status,
    get_verified_programs,
    verify_program,
  },

  // Combine all actions
  actions: [
    getAllDomainsTLDsAction,
    getOwnedAllDomainsAction,
    getOwnedDomainsForTLDAction,
    resolveDomainAction,
    getAllTopicsAction,
    getInferenceByTopicIdAction,
    getPriceInferenceAction,
    createGibworkTaskAction,
    createWebhookAction,
    deleteWebhookAction,
    getAssetsByOwnerAction,
    getWebhookAction,
    parseSolanaTransactionAction,
    resolveSolDomainAction,
    registerDomainAction,
    getPrimaryDomainAction,
    getMainAllDomainsDomainAction,
    getAllRegisteredAllDomainsAction,
    transferFromMultisigTreasuryAction,
    rejectMultisigProposalAction,
    executeMultisigProposalAction,
    depositToMultisigTreasuryAction,
    createMultisigAction,
    createMultisigProposalAction,
    approveMultisigProposalAction,
    simulateFeedAction,
    getCoingeckoTokenInfoAction,
    getCoingeckoTopGainersAction,
    getCoingeckoLatestPoolsAction,
    getCoingeckoTrendingPoolsAction,
    getCoingeckoTrendingTokensAction,
    getCoingeckoTokenPriceDataAction,
    elfaApiKeyStatusAction,
    elfaGetSmartMentionsAction,
    elfaGetTopMentionsByTickerAction,
    elfaPingAction,
    elfaSearchMentionsByKeywordsAction,
    elfaSmartTwitterAccountStats,
    elfaTrendingTokensAction,
    parseAccountAction,
    parseInstructionAction,
    getMessariAiAction,
    checkoutAction,
    confirmOrderAction,
    fetchOldestTokensAction,
    fetchRecentTokensAction,
    fetchTokenByCreatorAction,
    fetchTokenByInitializerAction,
    fetchTokenByMintAction,
    fetchTokenBySignatureAction,
    fetchTokensByCreatorsAction,
    fetchTokensByDurationAction,
    fetchTokensByInitializersAction,
    fetchTokensByMarketCapAction,
    fetchTokensByMetadataAction,
    fetchTokensByMintsAction,
    createVerificationPdaAction,
    decodeVerificationPdaDataAction,
    getProgramBuildLogAction,
    getProgramVerificationStatusAction,
    getVerificationJobStatusAction,
    getVerifiedProgramsAction,
    verifyProgramAction,
  ],

  // Initialize function
  initialize: function (): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

// Default export for convenience
export default MiscPlugin;
