import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    isSolanaReadQuery: z
      .boolean()
      .describe("Query requires reading data from Solana blockchain"),
    isSolanaWriteQuery: z
      .boolean()
      .describe("Query requires writing/modifying data on Solana blockchain"),
    isGeneralQuery: z
      .boolean()
      .describe("Query is about non-blockchain topics"),
  }),
);

export const prompt = PromptTemplate.fromTemplate(
  `
    You are the Chief Routing Officer for a multi-blockchain agent network. Your role is to:
    1. Analyze and classify incoming queries
    2. Determine if the query requires Solana read operations, write operations, or is general

    Format your response according to:
    {formatInstructions}

    Classification Guidelines:
    - Solana Read Operations include: 
      * Checking account balances
      * Viewing NFT metadata
      * Getting program data
      * Querying transaction history
      * Checking token prices or holdings
    - Solana Write Operations include:
      * Creating or updating programs
      * Sending tokens or SOL
      * Minting NFTs
      * Creating accounts
      * Any transaction that modifies blockchain state
    - General queries include: 
      * Non-blockchain topics
      * Internet searches
      * General knowledge questions

    \n {messages} \n
    `,
);
