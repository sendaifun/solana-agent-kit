import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaParseInstructionTool extends Tool {
  name = "solana_parse_instruction";
  description = `Parse a Solana instruction data on Solana blockchain.
  
  Inputs(input is a JSON string):
  programId: string, eg "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" (required)
  instructionData: string, eg "3UwpeiMtquiTRwEh3LDXQ2ackEUawDAPVnEmbcfFU66N4Knmo4ArVS1XPSjj5UvUtsdQSxGcksSP5ERNDR36DFz8VnkSNBBFt5LfGc3WV7nDpqSfrcguxcMSgE7it74MGBBXUix9tPdKxxete8o4DKEUyt4b6mWnR9DbnyiNL8JnhAddSh99YP8zXGAFboUYejp5sVoZrpcyj2i1BMoogv1Hu2BucZHEdzPSQ4Ws6g8x8aUmx7StsesEPU7cFMpCtfes9xzcCE9M" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.parseInstruction(
        parsedInput.programId,
        parsedInput.instructionData,
      );

      return JSON.stringify({
        status: "success",
        message: "Instruction data parsed successfully",
        name: result.name,
        layout: result.layout,
        data: result.data,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
