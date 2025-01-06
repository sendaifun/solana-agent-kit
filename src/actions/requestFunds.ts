import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { request_faucet_funds } from "../tools";

const requestFundsAction: Action = {
  name: "REQUEST_FUNDS",
  similes: [
    "request sol",
    "get test sol",
    "use faucet",
    "request test tokens",
    "get devnet sol",
  ],
  description: "Request SOL from Solana faucet (devnet/testnet only)",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Successfully requested faucet funds",
          network: "devnet.solana.com",
        },
        explanation: "Request SOL from the devnet faucet",
      },
    ],
  ],
  schema: z.object({}), // No input parameters required
  handler: async (agent: SolanaAgentKit, _input: Record<string, any>) => {
    await request_faucet_funds(agent);

    return {
      status: "success",
      message: "Successfully requested faucet funds",
      network: agent.connection.rpcEndpoint.split("/")[2],
    };
  },
};

export default requestFundsAction;
