import { HumanMessage } from "@langchain/core/messages";

export const generalQuestion = [
  new HumanMessage("Who is the president of Ecuador?"),
];

export const solanaReadQuery = [new HumanMessage("what is the price of SOL")];

export const solanaWriteQuery = [new HumanMessage("swap 0.1 usdc to sol")];
