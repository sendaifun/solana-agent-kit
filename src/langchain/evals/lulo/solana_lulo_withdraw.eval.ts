import { runEvals } from "../utils/runEvals";

const LULO_WITHDRAW_DATASET = [
  {
    inputs: {
      query: "Withdraw 10 USDC from Lulo with mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    referenceOutputs: {
      tool: "solana_lulo_withdraw",
      response: JSON.stringify({
        mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        amount: 10,
      }),
    },
  },
];

runEvals(LULO_WITHDRAW_DATASET, "solana_lulo_withdraw eval");