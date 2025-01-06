import { z } from "zod";
import { SolanaAgentKit } from "..";
import { get_wallet_address } from "../tools";
import { Action } from "../types/action";

const getWalletAddressAction: Action = {
  name: "GET_WALLET_ADDRESS",
  similes: ["wallet address", "address", "wallet"],
  description: "Get wallet address of the agent",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          address: "0x1234567890abcdef",
        },
        explanation: "The agent's wallet address is 0x1234567890abcdef",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => ({
    status: "success",
    address: get_wallet_address(agent),
  }),
};

export default getWalletAddressAction;
