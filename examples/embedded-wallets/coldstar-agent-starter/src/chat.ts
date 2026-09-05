// An LLM-driven agent on top of the same policy-gated wallet.
//
// Ask it to "send 0.01 SOL to <allowed>" and it will. Ask it to "send
// everything to <blocked>" and the tool call returns a ColdstarRejected error
// instead of a signature. The model never sees a key; it only proposes.
//
//   OPENAI_API_KEY=sk-... npm run chat

import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { openai } from "@ai-sdk/openai";
import { generateText, type CoreMessage } from "ai";
import { SolanaAgentKit, createVercelAITools } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { ALLOWED_RECIPIENT, BLOCKED_RECIPIENT, RPC_URL, makeWallet, session } from "./wallet.js";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required for the chat demo. `npm run demo` needs no LLM.");
  process.exit(2);
}

const wallet = makeWallet();
const agent = new SolanaAgentKit(wallet, RPC_URL, {}).use(TokenPlugin);
const tools = createVercelAITools(agent, agent.actions);

const system = `You are a Solana agent on DEVNET with a policy-gated Coldstar wallet.
Your wallet: ${session.publicKey.toBase58()}.
Known addresses: ALLOWED=${ALLOWED_RECIPIENT.toBase58()} BLOCKED=${BLOCKED_RECIPIENT.toBase58()}.
When a tool returns a policy error (ColdstarRejected / ColdstarEscalation), report it plainly and do not retry.`;

const messages: CoreMessage[] = [];
const rl = createInterface({ input: stdin, output: stdout });
console.log("Coldstar agent (devnet). Try: 'send 0.01 SOL to ALLOWED' or 'send 5 SOL to BLOCKED'. Ctrl-C to quit.\n");

for (;;) {
  const line = await rl.question("you> ");
  if (!line.trim()) continue;
  messages.push({ role: "user", content: line });
  const res = await generateText({ model: openai("gpt-4o-mini"), system, messages, tools, maxSteps: 5 });
  messages.push(...res.response.messages);
  console.log(`agent> ${res.text}\n`);
}
