import { NextRequest } from "next/server";

import { Interaction, InteractionResponse } from "@/types/interaction";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import initializeAgent from "@/lib/initAgent";
import { HumanMessage } from "@langchain/core/messages";
  
export async function POST(req: NextRequest) {
    const signature = req.headers.get('X-Signature-Ed25519') || "";
    const timestamp = req.headers.get('X-Signature-Timestamp') || "";
    if (!signature || !timestamp) {
        return Response.json({
            message: "Missing required headers"
        }, {status: 401})
    }
    
    const interaction: Interaction = await req.json()
    
    const isValidRequest = await verifyKey(
        JSON.stringify(interaction),
        process.env.DISCORD_PUBLIC_KEY!,
        signature,
        timestamp
    );

    if (!isValidRequest) {
        return Response.json({ 
            message: "Invalid signature" 
        }, {status: 401});
    }

    if (interaction.type === InteractionType.PING) {
        return Response.json({
            type: InteractionResponseType.PONG
        } as InteractionResponse,
        {
            headers: {
                'Content-Type': 'application/json',
            },

        })
    }

    if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
        return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: "I only accept, application command"
            }
        } as InteractionResponse,
        {
            headers: {
                'Content-Type': 'application/json',
            },

        })
    }

    const commandName = interaction.data.name;

    if (commandName !== "chat") {
        return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: "available command is /chat"
            }
        } as InteractionResponse,
        {
            headers: {
                'Content-Type': 'application/json',
            },

        })
    }

    const message = interaction.data.options[0].value;
    
    const {agent, config} = await initializeAgent();

    const stream = await agent.stream(
        { messages: [new HumanMessage(message)] },
        config,
    );

    let botResponse = "";
    try {
        for await (const chunk of stream) {
            if ("agent" in chunk) {
                botResponse += chunk.agent.messages[0].content
            }
        }
        return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: botResponse
            }
        } as InteractionResponse,
        {
            headers: {
                'Content-Type': 'application/json',
            },

        })
    } catch (error) {
        console.log("Error processing stream: ", error);
        return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: "cannot process the request, an error has occured"
            }
        } as InteractionResponse,
        {
            headers: {
                'Content-Type': 'application/json',
            },

        })
    }
}