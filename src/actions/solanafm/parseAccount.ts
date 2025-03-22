import { parse_account } from "../../tools";
import { Action } from "../../types/action";
import { z } from "zod";

const parseAccountAction: Action = {
  name: "PARSE_ACCOUNT",
  similes: [
    "parse account",
    "decode account",
    "read account",
    "inspect account",
    "analyze account",
  ],
  description:
    "Parse a Solana account data on the Solana blockchain with specified parameter. eg program ID and account data",
  examples: [
    [
      {
        input: {
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          accountData:
            "AQAAAKNtpf5xH4vTOhHcj+c7iFOBtiodZCZHvMJUCmaAWfmwAMqaOwAAAAAGAQEAAAAngUPsMTO0Ea8yotiDMEigFh6e3Pq4ZJzsKSQdW3kXsg==",
        },
        output: {
          status: "success",
          message: "Account data parsed successfully",
          programName: "mpl_token_metadata",
          layout: "<program layout>",
          data: "<parsed account data>",
        },
        explanation: "Parse an account data with program ID",
      },
    ],
  ],
  schema: z.object({
    programId: z.string(),
    accountData: z.string(),
  }),
  handler: async (input: Record<string, any>) => {
    try {
      const result = await parse_account(input.programId, input.accountData);

      return {
        status: "success",
        message: "Account data parsed successfully",
        programName: result.name,
        layout: result.layout,
        data: result.data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Parse account data failed: ${error.message}`,
      };
    }
  },
};

export default parseAccountAction;
