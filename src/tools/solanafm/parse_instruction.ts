import {
  checkIfInstructionParser,
  ParserType,
  SolanaFMParser,
} from "@solanafm/explorer-kit";
import { getProgramIdl, IdlItem } from "@solanafm/explorer-kit-idls";
import { InstructionParserResponse } from "../../types";

/**
 * Parse a Solana instruction data
 * @param program_id Solana program ID
 * @param instruction_data Solana instruction data
 * @returns Object containing the program name, instruction data layout, parsed instruction data
 */

export async function parse_instruction(
  program_id: string,
  instruction_data: string,
): Promise<InstructionParserResponse> {
  try {
    const idl: IdlItem | null = await getProgramIdl(program_id);

    if (!idl) {
      throw new Error(`Error fetching IDL for program ${program_id}`);
    }

    const instructionParser = new SolanaFMParser(idl, program_id).createParser(
      ParserType.INSTRUCTION,
    );

    if (!instructionParser || !checkIfInstructionParser(instructionParser)) {
      throw new Error(
        `Error creating instruction parser for program ${program_id}`,
      );
    }

    return {
      name: instructionParser.getProgramName(),
      layout: instructionParser.instructionsLayout,
      data: instructionParser.parseInstructions(instruction_data),
    };
  } catch (error) {
    throw new Error(`Error failed to parse instruction: ${error}`);
  }
}
