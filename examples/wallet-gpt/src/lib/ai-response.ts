import { PublicKey } from "@solana/web3.js";
import { Message } from "../utils/types";
import triggerCommand from "./commands";
import { GPTResponse } from "./llm";

export default async function AIResponse(
  chatHistory: Message[],
  publicKey: PublicKey,
  sendTransaction: any,
) {
  const response = await GPTResponse(chatHistory);
  const parsedResponse = JSON.parse(response?.arguments as string);

  const data = await triggerCommand(
    parsedResponse,
    publicKey,
    sendTransaction,
  );
  return data;
}
