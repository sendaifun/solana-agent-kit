import { InteractionResponseType } from "discord-interactions"

type InteractionDataOption = {
    name: string, 
    type: number, 
    value: string // contains passed in message, text parameter
}

type InteractionData = {
    id: string, 
    name: string, // command name
    options: Array<InteractionDataOption>
}

type Interaction = {
    data: InteractionData,
    token: string,
    type: number
}

type InteractionResponse = {
    type: InteractionResponseType,
    data: {
        content?: string
    }
}

export type { Interaction, InteractionResponse };