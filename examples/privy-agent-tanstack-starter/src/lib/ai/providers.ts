import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const myProvider = customProvider({
  languageModels: {
    "chat-model": openai("gpt-4o"),
    "chat-model-reasoning": wrapLanguageModel({
      model: openai("o3-mini"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gpt-3.5-turbo"),
    "artifact-model": openai("gpt-4"),
  },
  imageModels: {
    "small-model": openai.image("dall-e-3"),
  },
});
