import { parse_instruction } from "../../tools";
import { Action } from "../../types/action";
import { z } from "zod";

const parseInstructionAction: Action = {
  name: "PARSE_INSTRUCTION",
  similes: [
    "parse instruction",
    "decode instruction",
    "read instruction",
    "inspect instruction",
    "analyze instruction",
  ],
  description:
    "Parse a Solana instruction data on the Solana blockchain with specified parameter. eg program ID and instruction data",
  examples: [
    [
      {
        input: {
          programId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
          instructionData:
            "3UwpeiMtquiTRwEh3LDXQ2ackEUawDAPVnEmbcfFU66N4Knmo4ArVS1XPSjj5UvUtsdQSxGcksSP5ERNDR36DFz8VnkSNBBFt5LfGc3WV7nDpqSfrcguxcMSgE7it74MGBBXUix9tPdKxxete8o4DKEUyt4b6mWnR9DbnyiNL8JnhAddSh99YP8zXGAFboUYejp5sVoZrpcyj2i1BMoogv1Hu2BucZHEdzPSQ4Ws6g8x8aUmx7StsesEPU7cFMpCtfes9xzcCE9M",
        },
        output: {
          status: "success",
          message: "Instruction data parsed successfully",
          programName: "Associated Token Account Program",
          layout: "<program layout>",
          data: "<parsed instruction data>",
        },
        explanation: "Parse an instruction data with program ID",
      },
    ],
  ],
  schema: z.object({
    programId: z.string(),
    instructionData: z.string(),
  }),
  handler: async (input: Record<string, any>) => {
    try {
      const result = await parse_instruction(
        input.programId,
        input.instructionData,
      );

      return {
        status: "success",
        message: "Instruction data parsed successfully",
        programName: result.name,
        layout: result.layout,
        data: result.data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Parse instruction data failed: ${error.message}`,
      };
    }
  },
};

export default parseInstructionAction;
