import { NextResponse } from "next/server";
import { SolanaAgentService } from "@/lib/solana-agent";

const solanaAgent = new SolanaAgentService("id");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const response = await solanaAgent.processMessage(message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
    );
  }

}
