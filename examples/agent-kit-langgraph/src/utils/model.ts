import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

export const gpt4o = new ChatOpenAI({
  modelName: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY!,
});

export const gpt4oMini = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY!,
});
