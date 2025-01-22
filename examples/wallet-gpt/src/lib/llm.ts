"use server";

import { SYSTEM_PROMPT } from "@/utils/config";
import OpenAI from "openai";
import { Message } from "../utils/types";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export async function GPTResponse(chatHistory: Message[]) {
  chatHistory = [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatHistory,
    function_call: { name: "get_action_data" },
    functions: [
      {
        name: "get_action_data",
        description: "Get JSON object of performed action",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: [
                "send",
                "buy",
                "swap",
                "check_balance",
                "get_address",
                "create_token",
                "transaction_status",
                "recent_transaction",
                "not_found",
              ],
            },
            amount: {
              type: "number",
              description: "Amount to send or swap",
            },
            toPublicKey: {
              type: "string",
              description: "Recipient's public key",
            },
            fromToken: {
              type: "string",
              description: "Token to swap from",
            },
            toToken: {
              type: "string",
              description: "Token to swap to",
            },
            tokenName: {
              type: "string",
              description: "Token name",
            },
            tokenSymbol: {
              type: "string",
              description: "Token symbol",
            },
            tokenDecimals: {
              type: "number",
              description: "Token decimals",
            },
            uri: {
              type: "string",
              description: "Token image URI",
            },
            mintAmount: {
              type: "number",
              description: "Amount to mint",
            },
            message: {
              type: "string",
              description: "Response text for user",
            },
            misc: {
              type: "boolean",
              description: "Miscellaneous action",
            },
          },
          required: ["action", "message"],
        },
      },
    ],
  });
  return response.choices[0].message.function_call;
}
