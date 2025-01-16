// src/agents/instructionUtils.ts

import {
  Connection,
  PublicKey,
  TransactionInstruction,
  AccountMeta,
} from "@solana/web3.js";
import { InstructionData } from "@solana/spl-governance";

// Conversion function to transform `InstructionData` into `TransactionInstruction`
export function instructionDataToTransactionInstruction(
  instructionData: InstructionData,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: instructionData.programId,
    keys: instructionData.accounts.map((account) => ({
      pubkey: account.pubkey,
      isWritable: account.isWritable,
      isSigner: account.isSigner,
    })),
    data: Buffer.from(instructionData.data),
  });
}

// Conversion function to transform `TransactionInstruction` into `InstructionData`
export function transactionInstructionToInstructionData(
  transactionInstruction: TransactionInstruction,
): InstructionData {
  return new InstructionData({
    programId: transactionInstruction.programId,
    accounts: transactionInstruction.keys.map((key) => ({
      pubkey: key.pubkey,
      isWritable: key.isWritable,
      isSigner: key.isSigner,
    })),
    data: new Uint8Array(transactionInstruction.data),
  });
}

// Main Example
export async function processInstructions(
  connection: Connection,
  programId: PublicKey,
  transactionInstructions: TransactionInstruction[],
): Promise<void> {
  // Convert TransactionInstruction[] to InstructionData[]
  const instructionDataArray: InstructionData[] = transactionInstructions.map(
    (instruction) => transactionInstructionToInstructionData(instruction),
  );

  // Simulate a function that requires `InstructionData[]` as input
  const mockFunctionRequiringInstructionData = (
    instructions: InstructionData[],
  ) => {
    console.log("Processed InstructionData[]", instructions);
  };

  mockFunctionRequiringInstructionData(instructionDataArray);

  // If you need to convert back to TransactionInstruction[], use this:
  const convertedBackToTransactionInstructions: TransactionInstruction[] =
    instructionDataArray.map((data) =>
      instructionDataToTransactionInstruction(data),
    );

  console.log(
    "Converted back to TransactionInstruction[]",
    convertedBackToTransactionInstructions,
  );
}
