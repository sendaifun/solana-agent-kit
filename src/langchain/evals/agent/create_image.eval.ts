import { runEvals } from "../utils/runEvals";

const CREATE_IMAGE_DATASET = [
  {
    inputs: {
      query:
        "Generate me an image of a Solana logo but with the colors red white and blue",
    },
    referenceOutputs: {
      tool: "solana_create_image",
      response: "Solana logo but with the colors red white and blue",
    },
  },

  {
    inputs: {
      query: "Can you produce an image of a cat playing the piano?",
    },
    referenceOutputs: {
      tool: "solana_create_image",
      response: "A cat playing the piano.",
    },
  },
];

runEvals(CREATE_IMAGE_DATASET, "Create image tests");
