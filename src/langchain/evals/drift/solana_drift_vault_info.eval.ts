import { runEvals } from "../utils/runEvals";

const DRIFT_VAULT_INFO_DATASET = [
  {
    inputs: {
      query: "Get info about vault named 'AlphaDriftVault'"
    },
    referenceOutputs: {
      tool: "drift_vault_info",
      response: JSON.stringify({ vaultNameOrAddress: "AlphaDriftVault" }),
    },
  },
  {
    inputs: {
      query: "Get info about vault 77HpMS8rr4z2"
    },
    referenceOutputs: {
      tool: "drift_vault_info",
      response: JSON.stringify({ vaultNameOrAddress: "77HpMS8rr4z2" }),
    },
  },
];

runEvals(DRIFT_VAULT_INFO_DATASET, "drift_vault_info eval");