import { runEvals } from "../utils/runEvals";

const VOLTR_GET_POSITION_VALUES_DATASET = [
  {
    inputs: {
      query:
        "Check position values in voltr vault D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ",
    },
    referenceOutputs: {
      tool: "solana_voltr_get_position_values",
      response: "D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ",
    },
  },
];

runEvals(
  VOLTR_GET_POSITION_VALUES_DATASET,
  "solana_voltr_get_position_values eval",
);
