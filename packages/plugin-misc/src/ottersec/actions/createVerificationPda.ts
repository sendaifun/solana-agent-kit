import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { create_verification_pda } from "../tools";

const createVerificationPda: Action = {
  name: "OSEC_CREATE_VERIFICATION_PDA",
  description:
    "Generate a PDA for program verification and verify the program using Otter Sec",
  similes: [
    "create program verification pda",
    "generate program verification pda",
  ],
  examples: [
    [
      {
        input: {
          programId: "mRXspNQ2wBD4ekkCE2wP5gxKAjuHovJzqTh42KY3Zbn",
          version: "0.4.8",
          gitUrl: "https://github.com/0xobedient/solana-program-verifier-test",
          commit: "a508ea5427072dfd87c374b0c9054a3b45d56dda",
          args: ["--library-name", "gm_homos"],
          deploySlot: 352120976,
        },
        output: {
          success: true,
          signature:
            "2JjgLrKiP49EjySzGujSuCxUqQSuqetYa46UaFRByyewVyk7gYVsfqHb84B6VarHBtP9s3GNRYVirmaK2HvhPfYY",
          pda: "2CN1icVuzEGeJrCPWmVvMvDTC7oFKZho9McgcCEjHz39",
        },
        explanation: "program verification pda is successflly generated",
      },
    ],
  ],
  schema: z.object({
    programId: z.string(),
    version: z.string(),
    gitUrl: z.string(),
    commit: z.string(),
    args: z.string().array(),
    deploySlot: z.number(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { programId, version, gitUrl, commit, args, deploySlot } = input;

      const data = await create_verification_pda(agent, programId, {
        version,
        gitUrl,
        commit,
        args,
        deploySlot,
      });

      return {
        status: "success",
        data,
        message: "Solana program verification PDA is successfully generated",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create program verification pda ${error.message}`,
        code: error.code || "OTTERSEC_CREATE_VERIFICATION_PDA_FAILED",
      };
    }
  },
};

export default createVerificationPda;
