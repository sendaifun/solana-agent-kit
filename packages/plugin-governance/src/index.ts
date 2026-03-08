import { Plugin, SolanaAgentKit } from "solana-agent-kit";
import governanceVoteAction from "./actions/vote";
import governanceCreateRealmAction from "./actions/create_realm";
import governanceCreateProposalAction from "./actions/create_proposal";
import governanceDepositTreasuryAction from "./actions/deposit";
import { governanceVote } from "./tools/vote";
import { governanceCreateRealm } from "./tools/create_realm";
import { governanceCreateProposal } from "./tools/create_proposal";
import { governanceDepositTreasury } from "./tools/deposit";

const GovernancePlugin: Plugin = {
  name: "governance",
  methods: {
    governanceVote,
    governanceCreateRealm,
    governanceCreateProposal,
    governanceDepositTreasury,
  },
  actions: [
    governanceVoteAction,
    governanceCreateRealmAction,
    governanceCreateProposalAction,
    governanceDepositTreasuryAction,
  ],
  initialize: function (): void {
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} as any;

export default GovernancePlugin;
