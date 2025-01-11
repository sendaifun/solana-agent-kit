import { PublicKey } from "@solana/web3.js";
import { Action } from "../types/action";
import { z } from "zod";
import { manageVoteDelegation } from "../tools/manage_vote_delegation";

const manageVoteDelegationAction: Action = {
  name: "MANAGE_VOTE_DELEGATION",
  similes: [
    "delegate vote",
    "transfer voting power",
    "assign vote delegation",
    "set voting delegate",
  ],
  description: `Delegate the voting power from one token owner to another in the Solana governance program.`,
  examples: [
    [
      {
        input: {
          programId: "GovkDgXfUEeq7yuFEMfoj7XV6jDPBykdr9O6GBWgjz7a",
          programVersion: 3,
          realm: "6k4tvNjkL1shSmhFjdUzGFyQFC4ZKTpaXnKds1z9jEwF",
          governingTokenMint: "5gWchWfCZXsMD7szLxo8YYWJGUXRQCeoe8TKrbrB3ia5",
          governingTokenOwner: "5Rh5HfQDsaiHzRJrgFXRMQc4zzkrK9oobcxtnt3cDw9j",
          governanceAuthority: "9QhGRcJNK9sVkqgj5wZfnhLVxRX5R9UkfgH3ZrcqjTm4",
          newGovernanceDelegate: "3R5cXKgWN5tyA5ZWYhcF7rJMGd9c2TLqn9R3ZcR2RQh8",
        },
        output: {
          status: "success",
          signature: "2GjfL3N9E4cHp7WhDZRkx7oF2J9m3Sf5hT6zRHcVWUjp",
        },
        explanation: "Delegate voting power to a new governance delegate",
      },
    ],
  ],
  schema: z.object({
    programId: z.string(),
    programVersion: z.number(),
    realm: z.string(),
    governingTokenMint: z.string(),
    governingTokenOwner: z.string(),
    governanceAuthority: z.string(),
    newGovernanceDelegate: z.string(),
  }),
  handler: async (input: Record<string, any>) => {
    const signature = await manageVoteDelegation(
      new PublicKey(input.programId),
      input.programVersion,
      new PublicKey(input.realm),
      new PublicKey(input.governingTokenMint),
      new PublicKey(input.governingTokenOwner),
      new PublicKey(input.governanceAuthority),
      new PublicKey(input.newGovernanceDelegate),
    );

    return {
      status: "success",
      signature,
    };
  },
};

export default manageVoteDelegationAction;
