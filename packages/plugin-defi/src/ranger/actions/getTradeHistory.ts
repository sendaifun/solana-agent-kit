import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getTradeHistorySchema = z.object({
  public_key: z.string(),
  platforms: z.array(z.string()).optional(),
  symbols: z.array(z.string()).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

export type GetTradeHistoryInput = z.infer<typeof getTradeHistorySchema>;

interface GetTradeHistoryContext {
  apiKey: string;
}

export const getTradeHistoryAction: Action = {
  name: "GET_TRADE_HISTORY",
  similes: ["get trade history", "fetch trades", "trade history"],
  description: "Fetch trade history for a user from the Ranger API.",
  examples: [
    [
      {
        input: { public_key: "YOUR_PUBLIC_KEY" },
        output: { trades: [] },
        explanation: "Get all trade history for a user."
      }
    ]
  ],
  schema: getTradeHistorySchema,
  handler: async (_agent: unknown, input: GetTradeHistoryInput, { apiKey }: GetTradeHistoryContext) => {
    const params = new URLSearchParams();
    params.set("public_key", input.public_key);
    if (input.platforms) input.platforms.forEach((p: string) => params.append("platforms", p));
    if (input.symbols) input.symbols.forEach((s: string) => params.append("symbols", s));
    if (input.start_time) params.set("start_time", input.start_time);
    if (input.end_time) params.set("end_time", input.end_time);

    const response = await fetch(`${RANGER_DATA_API_BASE}/v1/trade_history?${params.toString()}", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Get trade history request failed: ${error.message}`);
    }
    return response.json();
  },
}; 