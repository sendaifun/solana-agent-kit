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

export const analyzerPrompt = "Analyze the portfolio and provide trends and scores for each token.";