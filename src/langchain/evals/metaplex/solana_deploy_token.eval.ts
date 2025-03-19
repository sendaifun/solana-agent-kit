import { runEvals } from "../utils/runEvals";

const DEPLOY_TOKEN_DATASET = [
  {
    inputs: {
      query:
        "Deploy a token named DemoToken with symbol DEMO and decimals = 6 using a JSON uri at https://example.com/demo.json"
    },
    referenceOutputs: {
      tool: "solana_deploy_token",
      response: JSON.stringify({
        name: "DemoToken",
        uri: "https://example.com/demo.json",
        symbol: "DEMO",
        decimals: 6
      }),
    },
  },
  {
    inputs: {
      query:
        "Create a new token: name=TestCoin, symbol=TCO, no decimals, using a uri at https://test.coin/metadata.json"
    },
    referenceOutputs: {
      tool: "solana_deploy_token",
      response: JSON.stringify({
        name: "TestCoin",
        uri: "https://test.coin/metadata.json",
        symbol: "TCO"
      }),
    },
  },
];

runEvals(DEPLOY_TOKEN_DATASET, "solana_deploy_token eval");