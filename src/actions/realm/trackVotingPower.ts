import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { trackVotingPower } from "../../tools/realm/track_voting_power";

const trackVotingPowerAction: Action = {
  name: "TRACK_VOTING_POWER",
  similes: [
    "check voting power",
    "view voting power",
    "get governance voting power",
    "show voting power",
  ],
  description: `Get the voting power of a given wallet in a specific governance realm.
  If you provide the wallet's token address, the voting power will be calculated accordingly.`,
  examples: [
    [
      {
        input: {
          realm: "6k4tvNjkL1shSmhFjdUzGFyQFC4ZKTpaXnKds1z9jEwF",
        },
        output: {
          status: "success",
          votingPower: 1500,
        },
        explanation:
          "Get the voting power for a specific wallet and governance realm",
      },
    ],
  ],
  schema: z.object({
    realm: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const votingPower = await trackVotingPower(
      agent,
      new PublicKey(input.realmID),
    );

    return {
      status: "success",
      votingPower,
    };
  },
};

export default trackVotingPowerAction;
