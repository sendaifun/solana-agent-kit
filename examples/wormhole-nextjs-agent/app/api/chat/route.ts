import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaAgentKit } from "solana-agent-kit";
import {
  CreateWrappedTokenTool,
  CctpTransferTool,
  GetWormholeSupportedChainsTool,
  TokenTransferTool,
} from "solana-agent-kit/dist/langchain";

const llm = new ChatOpenAI({
  temperature: 0.7,
  model: "gpt-4o-mini",
  cache: false,
});

const solanaAgent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  process.env.OPENAI_API_KEY!,
);

const tools = [
  new GetWormholeSupportedChainsTool(solanaAgent),
  new TokenTransferTool(solanaAgent),
  new CctpTransferTool(solanaAgent),
  new CreateWrappedTokenTool(solanaAgent),
];

const agent = createReactAgent({
  llm,
  tools,
  messageModifier: `
      You are a helpful agent that specializes in cross-chain operations using Wormhole Protocol on Solana. 
      You can help users transfer tokens between different blockchains, create wrapped tokens, and perform CCTP transfers.
      If you ever need funds, you can request them from the faucet. If not, you can provide your wallet details and request funds from the user.
      If there is a 5XX (internal) HTTP error code, ask the user to try again later.
      If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it
      themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information.
      Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      IMPORTANT: Never repeat the user's question in your response.
    `,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  console.log("messages", messages);

  // Create a streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const agentStream = await agent.stream(
          { messages },
          {
            streamMode: "values",
          },
        );

        for await (const { messages: agentMessages } of agentStream) {
          const latestMsg = agentMessages[agentMessages.length - 1];
          let chunk;

          if (latestMsg?.content) {
            // Remove any instances where the agent repeats the user's last question
            const lastUserMessage = messages[messages.length - 1].content;
            let content = latestMsg.content;

            // Check if the response starts with the user's question
            if (content.startsWith(lastUserMessage)) {
              content = content.substring(lastUserMessage.length).trim();
            }

            // Check if the response contains "what is wormhole?" followed by the answer
            const questionPattern = new RegExp(`^${lastUserMessage}\\s*`, "i");
            content = content.replace(questionPattern, "");

            chunk = content;
          } else if (latestMsg?.tool_calls?.length > 0) {
            chunk = JSON.stringify(latestMsg.tool_calls);
          } else {
            chunk = JSON.stringify(latestMsg);
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
          );
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
