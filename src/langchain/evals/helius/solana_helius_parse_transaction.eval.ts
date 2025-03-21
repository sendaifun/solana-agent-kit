import { runEvals } from "../utils/runEvals";

const HELIUS_PARSE_TRANSACTION_DATASET = [
  {
    inputs: {
      query:
        "Parse solana transaction 2xa4PHrsv3TwaWfkt3yubKEtwCP31eMfem2oGeA19EzTM8Uu2fuNhrcRmuEiVxnfEXRrYRuvHu8VKoJpdN2XPBwp using helius",
    },
    referenceOutputs: {
      tool: "solana_parse_transaction_helius",
      response:
        "2xa4PHrsv3TwaWfkt3yubKEtwCP31eMfem2oGeA19EzTM8Uu2fuNhrcRmuEiVxnfEXRrYRuvHu8VKoJpdN2XPBwp",
    },
  },
];

runEvals(
  HELIUS_PARSE_TRANSACTION_DATASET,
  "solana_helius_parse_transaction eval",
);
