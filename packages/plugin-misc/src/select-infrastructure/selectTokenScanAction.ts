import { type Action } from "solana-agent-kit";

const PROTO = "https";
const SUB = "api";
const DOMAIN = "tryaigility";
const TLD = "com";
const BASE_URL = process.env.SELECT_GATEWAY_URL ?? `${PROTO}://${SUB}.${DOMAIN}.${TLD}`;

const PROGRAM_ID = "E3XAx7qEKHte9kmWKhuyAVxb8CgE2g4k5FqkrRx2kdsF";

export const selectTokenScanAction: Action = {
  name: "SELECT_TOKEN_SCAN",
  description:
    "Run a forensic risk scan on a Solana SPL token before swapping or interacting with it. " +
    "Checks RugCheck risk score, Mint Authority, Freeze Authority, holder concentration, " +
    "and liquidity depth. Returns a session for purchasing the full SHA-256 verified token dossier (5 USDC).",
  similes: [
    "check token safety",
    "scan token risk",
    "verify token security",
    "token rug check",
    "is this token safe",
    "check if token is rugged",
  ],
  examples: [
    [
      {
        input: { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
        output: {
          status: "success",
          sessionId: "tscan-1234567890-abc123",
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          priceUsdc: 5,
          message: "Token scan session created. Pay 5 USDC to receive the forensic dossier.",
        },
        explanation: "Creates a token scan session for USDC",
      },
    ],
  ],

  async handler(_agent: any, input: Record<string, string>) {
    const { mint } = input;
    if (!mint || typeof mint !== "string") {
      throw new Error("Missing required parameter: mint (Solana SPL token address)");
    }

    const r = await fetch(`${BASE_URL}/api/token-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mint }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: r.statusText }));
      throw new Error(`Token scan failed: ${(err as any).error ?? r.statusText}`);
    }

    const data = await r.json() as Record<string, unknown>;

    return {
      status: "success",
      sessionId: data.sessionId,
      mint: data.mint,
      priceUsdc: data.priceUsdc,
      programId: PROGRAM_ID,
      providerWallet: data.providerWallet,
      checkoutUrl: BASE_URL,
      apiCommand: `curl -X POST ${BASE_URL}/api/token-scan -H "Content-Type: application/json" -d '{"mint":"${mint}"}'`,
      message: `Token scan session created for ${(data.mint as string).slice(0, 8)}... Pay ${data.priceUsdc} USDC via Solana Pay at ${BASE_URL} to receive the full forensic dossier.`,
    };
  },
};

export default selectTokenScanAction;
