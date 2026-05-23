import { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import MoonPay actions
import moonpayGetBuyQuoteAction from "./moonpay/actions/getBuyQuote";
import moonpayGetSellQuoteAction from "./moonpay/actions/getSellQuote";
import moonpayGetTransactionAction from "./moonpay/actions/getTransaction";
import moonpayGenerateOnRampUrlAction from "./moonpay/actions/generateOnRampUrl";
import moonpayGenerateOffRampUrlAction from "./moonpay/actions/generateOffRampUrl";

// Import MoonPay tools
import {
  moonpayGetBuyQuote,
  moonpayGetSellQuote,
  moonpayGetTransaction,
  moonpayGenerateOnRampUrl,
  moonpayGenerateOffRampUrl,
} from "./moonpay/tools";

export * from "./moonpay/tools";
export * from "./moonpay/types";

const MoonPayPlugin = {
  name: "moonpay",

  methods: {
    moonpayGetBuyQuote,
    moonpayGetSellQuote,
    moonpayGetTransaction,
    moonpayGenerateOnRampUrl,
    moonpayGenerateOffRampUrl,
  },

  actions: [
    moonpayGetBuyQuoteAction,
    moonpayGetSellQuoteAction,
    moonpayGetTransactionAction,
    moonpayGenerateOnRampUrlAction,
    moonpayGenerateOffRampUrlAction,
  ],

  initialize: function (): void {
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

export default MoonPayPlugin;
