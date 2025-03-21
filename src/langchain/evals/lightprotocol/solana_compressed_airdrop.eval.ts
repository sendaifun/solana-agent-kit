import { runEvals } from "../utils/runEvals";

const COMPRESSED_AIRDROP_DATASET = [
  {
    inputs: {
      query:
        "Airdrop 100 tokens of mint 4h2coM1Jsbyy4qi723rKR5pz9rLmLjQvEDf9lm6JFgNu to [9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u]. Use ZK compression.",
    },
    referenceOutputs: {
      tool: "solana_compressed_airdrop",
      response: JSON.stringify({
        mintAddress: "4h2coM1Jsbyy4qi723rKR5pz9rLmLjQvEDf9lm6JFgNu",
        amount: 100,
        decimals: 6,
        recipients: ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u"],
      }),
    },
  },
  {
    inputs: {
      query:
        "Send 50 tokens from E5fu1VX4TTq3xdVXz1wdYzbuYBzYQu5YNvLaWaoe2d1t to 2 recipients, each gets 50, with no logs. Use ZK compression.",
    },
    referenceOutputs: {
      tool: "solana_compressed_airdrop",
      response: JSON.stringify({
        mintAddress: "E5fu1VX4TTq3xdVXz1wdYzbuYBzYQu5YNvLaWaoe2d1t",
        amount: 50,
        decimals: 9,
        recipients: [
          "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u",
          "8Ub34d4u1pBYiPxsegbht3Ff62J4KgFrHn5ai7pRjHHZ",
        ],
        shouldLog: false,
      }),
    },
  },
];

runEvals(COMPRESSED_AIRDROP_DATASET, "solana_compressed_airdrop eval");
