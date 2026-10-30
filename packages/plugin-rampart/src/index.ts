import type { Plugin, SolanaAgentKit } from "solana-agent-kit";

import rampartSpendAction from "./rampart/actions/rampartSpend";
import { rampartSpend } from "./rampart/tools";

const RampartPlugin = {
  name: "rampart",

  methods: {
    rampartSpend,
  },

  actions: [rampartSpendAction],

  initialize: function (): void {
    for (const [methodName, method] of Object.entries(this.methods)) {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    }
  },
} satisfies Plugin;

export default RampartPlugin;
