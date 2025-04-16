import { tool } from "ai";
import { z } from "zod";

export function listParaToolsWeb() {
    const tools: Record<string, any> = {};
    const actions = [
        {
            name: "CLAIM_PARA_PREGEN_WALLET",
            description: "Claim a pregen wallet for Para",
            similes: [
                "claim para pregen wallet"
            ],
            schema: z.object({ email: z.string().describe("The user email to claim the wallet for"),}),
        },
        {
            name: "GET_ALL_WALLETS",
            description: "Get all wallets",
            similes: [
                "get all wallets owned by the user"
            ],
            schema: z.object({}),
        },
        {
            name: "USE_WALLET",
            description: "Use a wallet",
            similes: [
                "use wallet"
            ],
            schema: z.object({
                walletId: z.string().describe("The wallet ID to use")
            }),
        }
    ];
    
    for (const action of actions) {
        tools[action.name] = tool({
            id: action.name as `${string}.${string}`,
            description: `
            ${action.description}

            Similes: ${action.similes.map(
                (simile) => `
                ${simile}
            `,
            )}
            `.slice(0, 1023),
            parameters: action.schema,
            execute: async () => action.name
        });
    }
    
    return tools;
}