import type { Plugin } from "solana-agent-kit";
import verifyAgentAction from "./actions/verifyAgent";
import checkCredentialAction from "./actions/checkCredential";
import { verify_agent } from "./tools/verify_agent";
import { check_credential } from "./tools/check_credential";

const AgentPassPlugin = {
  name: "agentpass",

  methods: {
    verify_agent,
    check_credential,
  },

  actions: [
    verifyAgentAction,
    checkCredentialAction,
  ],

  initialize: function (): void {
    // Methods are stateless, no initialization needed
  },
} satisfies Plugin;

export default AgentPassPlugin;
export { verify_agent, check_credential };
