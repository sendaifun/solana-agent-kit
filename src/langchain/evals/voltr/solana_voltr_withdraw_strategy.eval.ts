import { runEvals } from "../utils/runEvals";

const VOLTR_WITHDRAW_STRATEGY_DATASET = [
  {
    inputs: {
      query: "Withdraw 100 from strategy JBcq3c8A6faRh9eK6CuyKZyEfspZtKhiMY73knmkQ48t in vault EmzD1NKBdY4tiZXKn1tB44hBpT2gVpgx1EFi9N1shxCS"
    },
    referenceOutputs: {
      tool: "solana_voltr_withdraw_strategy",
      response: JSON.stringify({
        withdrawAmount: 100,
        vault: "EmzD1NKBdY4tiZXKn1tB44hBpT2gVpgx1EFi9N1shxCS",
        strategy: "JBcq3c8A6faRh9eK6CuyKZyEfspZtKhiMY73knmkQ48t"
      }),
    },
  },
  {
    inputs: {
      query: "Withdraw 2500 from Voltr strategy WqTdF4jHEt89qKWHSK3nErZKfC3G27gx9895W9tiUQ3 in vault 4vQaA7gEr8fwkcbLSgvBBYnU6nD88b7KyxstPBErbt6P"
    },
    referenceOutputs: {
      tool: "solana_voltr_withdraw_strategy",
      response: JSON.stringify({
        withdrawAmount: 2500,
        vault: "4vQaA7gEr8fwkcbLSgvBBYnU6nD88b7KyxstPBErbt6P",
        strategy: "WqTdF4jHEt89qKWHSK3nErZKfC3G27gx9895W9tiUQ3"
      }),
    },
  },
];

runEvals(VOLTR_WITHDRAW_STRATEGY_DATASET, "solana_voltr_withdraw_strategy eval");