import { runEvals } from "../utils/runEvals";

const DERIVE_DRIFT_VAULT_ADDRESS_DATASET = [
  {
    inputs: {
      query: "What is the vault address for the vault named 'MyDriftVault'?"
    },
    referenceOutputs: {
      tool: "derive_drift_vault_address",
      response: JSON.stringify({ name: "MyDriftVault" }),
    },
  },
];

runEvals(DERIVE_DRIFT_VAULT_ADDRESS_DATASET, "derive_drift_vault_address eval");