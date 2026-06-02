import type { Plugin, SolanaAgentKit } from "solana-agent-kit";

import {
  createStreamAction,
  cancelStreamAction,
  withdrawFromStreamAction,
  topUpStreamAction,
  getStreamDataAction,
} from "./actions";

import {
  createStream,
  cancelStream,
  withdrawFromStream,
  topUpStream,
  getStreamData,
} from "./tools";

const StreamflowPlugin = {
  name: "streamflow",

  methods: {
    createStream,
    cancelStream,
    withdrawFromStream,
    topUpStream,
    getStreamData,
  },

  actions: [
    createStreamAction,
    cancelStreamAction,
    withdrawFromStreamAction,
    topUpStreamAction,
    getStreamDataAction,
  ],

  initialize: function (agent: SolanaAgentKit): void {
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

export default StreamflowPlugin;
