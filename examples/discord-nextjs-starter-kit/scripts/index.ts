import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";

dotenv.config();

const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_BASE_URL = "https://discord.com/api/v9";

interface CommandOption {
    name: string;
    description: string;
    type: number;
    required: boolean;
}

interface Command {
    name: string;
    description: string;
    options: CommandOption[];
}

async function registerCommand() {
    if (!APPLICATION_ID || !DISCORD_BOT_TOKEN) {
        throw new Error("Missing required environment variables");
    }

    const url = `${API_BASE_URL}/applications/${APPLICATION_ID}/commands`;
    
    const command: Command = {
        name: "chat",
        description: "Chat With Solana Agent",
        options: [{
            name: "message",
            description: "this will be the prompt",
            type: 3, 
            required: true
        }]
    };

    try {
        const response: AxiosResponse = await axios.post(url, command, {
            headers: {
                "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Command registered successfully:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Failed to register command:", error.response?.data || error.message);
        } else {
            console.error("An unexpected error occurred:", error);
        }
        throw error;
    }
}

registerCommand()
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
});