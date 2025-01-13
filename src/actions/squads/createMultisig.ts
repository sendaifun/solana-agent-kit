import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { create_squads_multisig } from "../../tools";
import { PublicKey } from "@solana/web3.js";

const createMultisigAction: Action = {
  name: "CREATE_MULTISIG_ACTION",
  similes: [
    "create multisig",
    "create squads multisig",
    "create 2-by-2 multisig",
    "create 2-of-2 multisig",
    "create 2-of-2 multisig account",
    "create 2-of-2 multisig account on Solana",
  ],
  description: `Create a 2-of-2 multisig account on Solana using Squads with the user and the agent, where both approvals will be required to run the transactions.
  
  Note: For one AI agent, only one 2-by-2 multisig can be created as it is pair-wise.`,
  examples: [
    [
      {
        input: {
          creator: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
        },
        output: {
          status: "success",
          message: "2-by-2 multisig account created successfully",
          signature: "4xKpN2...",
        },
        explanation: "Create a 2-of-2 multisig account on Solana",
      },
    ],
  ],
  schema: z.object({
    creator: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const multisig = await create_squads_multisig(
      agent,
      new PublicKey(input.creator as string),
    );

    return {
      status: "success",
      message: "2-by-2 multisig account created successfully",
      signature: multisig,
    };
  },
};

export default createMultisigAction;
