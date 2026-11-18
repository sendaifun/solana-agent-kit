import type { Plugin } from "solana-agent-kit";
import deliveryScoreAction from "./actions/deliveryScore";
import txCheckAction from "./actions/txCheck";
import { checkUnsignedSolanaTx, scoreX402Url } from "./apex";

const ApexPlugin = {
  name: "apex",
  methods: {
    checkUnsignedSolanaTx,
    scoreX402Url,
  },
  actions: [txCheckAction, deliveryScoreAction],
  initialize: function (): void {
    // The methods call public HTTPS only. No wallet is read.
  },
} satisfies Plugin;

export default ApexPlugin;
