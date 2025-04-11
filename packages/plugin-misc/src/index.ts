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

// tiplink
import createTiplinkAction from "./tiplink/actions/createTiplinks";

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
import { create_TipLink } from "./tiplink/tools";

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
    create_TipLink,
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
    createTiplinkAction,
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
  ],

  // Initialize function
  initialize: function (agent: SolanaAgentKit): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method.bind(null, agent);
      }
    });

    // Any necessary initialization logic
    if (!agent.config.OPENAI_API_KEY) {
      console.warn("Warning: OPENAI_API_KEY not provided in config");
    }
  },
} satisfies Plugin;

// Default export for convenience
export default MiscPlugin;
