import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { decode_verification_pda_data } from "../tools";

const decodeVerificationPdaData: Action = {
  name: "OSEC_DECODE_VERIFICATION_PDA_DATA",
  description: "Decode the PDA data composed in hex.",
  similes: [
    "decode verification pda hex",
    "parse verification pda hex",
    "decode verification pda data",
    "parse verification pda data",
  ],
  examples: [
    [
      {
        input: {
          hex: "ce65c2888771730ca28e257dae8c81dc8ce27c9cc2451fb1837c52039847481f5b65cc6f152573c3efae07731701872e5391cb1a51627c845f1e12e9754d110f87751ac868003b5f05000000302e342e383300000068747470733a2f2f6769746875622e636f6d2f30786f62656469656e742f76657269666965642d70726f6772616d2d726f6f742800000064633032373661643461306239313634613433356134633365396638383639663736623863306262020000000e0000002d2d6c6962726172792d6e616d650d000000667269656e64795f73706f6f6e604af91400000000ff",
        },
        output: {
          address: "mRXspNQ2wBD4ekkCE2wP5gxKAjuHovJzqTh42KY3Zbn",
          signer: "H8cMR58GhYszD5uBE5YT4xtbsei3L58ZjdQJ6t4Tcv46",
          version: "0.4.8",
          git_url: "https://github.com/0xobedient/solana-program-verifier-test",
          commit: "a508ea5427072dfd87c374b0c9054a3b45d56dda",
          deploy_slot: 352120976,
          bump: 255,
        },
        explanation: "program verification pda hex data successfully decoded",
      },
    ],
  ],
  schema: z.object({
    hex: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { hex } = input;

      const data = decode_verification_pda_data({ hex });

      return {
        status: "success",
        data,
        message:
          "Solana program verification pda hex data is successfully decoded",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Solana program verification pda hex data failed ${error.message}`,
        code: error.code || "OTTERSEC_DECODE_VERIFICATION_PDA_DATA_FAILED",
      };
    }
  },
};

export default decodeVerificationPdaData;
