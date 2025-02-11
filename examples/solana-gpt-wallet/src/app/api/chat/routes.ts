import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say this is a test" }],
    });
    
    NextResponse.json(response.choices[0].message.content);
    
  } catch (error) {
    return new Response('Error processing your request', { status: 500 })
  }
}


