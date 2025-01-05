import { NextRequest } from "next/server";

import { Interaction, InteractionResponse } from "@/types/interaction";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import { HumanMessage } from "@langchain/core/messages";

import { verifyInteractionRequest } from "@/lib/verifyReq";
import initializeAgent from "@/lib/initAgent";

export async function POST(req: NextRequest) {
  const verifyResult = await verifyInteractionRequest(
    req,
    process.env.DISCORD_PUBLIC_KEY as string,
  );

  if (!verifyResult.isValid || !verifyResult.interaction) {
    return new Response("Invalid request", { status: 401 });
  }

  const { interaction } = verifyResult as { interaction: Interaction };

  if (interaction.type === InteractionType.PING) {
    return Response.json(
      {
        type: InteractionResponseType.PONG,
      } as InteractionResponse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return Response.json(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "I only accept, application command",
        },
      } as InteractionResponse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const commandName = interaction.data.name;

  if (commandName !== "chat") {
    return Response.json(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "available command is /chat",
        },
      } as InteractionResponse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const message = interaction.data.options[0].value;

  const { agent, config } = await initializeAgent();

  const stream = await agent.stream(
    { messages: [new HumanMessage(message)] },
    config,
  );

  let botResponse = "";
  try {
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        botResponse += chunk.agent.messages[0].content;
      }
    }
    return Response.json(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: botResponse,
        },
      } as InteractionResponse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.log("Error processing stream: ", error);
    return Response.json(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "cannot process the request, an error has occured",
        },
      } as InteractionResponse,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
