import { NextResponse } from 'next/server'

/// Gives the information if registered env information
export async function GET() {
  return NextResponse.json({
    isOpenAIKeySet: !!process.env.OPENAI_API_KEY,
    isSolanaKeySet: !!process.env.SOLANA_SECRET_KEY && !!process.env.SOLANA_PUBLIC_KEY,
  })
}
