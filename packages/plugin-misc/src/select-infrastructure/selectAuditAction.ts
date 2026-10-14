import { type Action } from "solana-agent-kit";

const PROTO = "https";
const SUB = "api";
const DOMAIN = "tryaigility";
const TLD = "com";
const BASE_URL = process.env.SELECT_GATEWAY_URL ?? `${PROTO}://${SUB}.${DOMAIN}.${TLD}`;

const PROGRAM_ID = "E3XAx7qEKHte9kmWKhuyAVxb8CgE2g4k5FqkrRx2kdsF";

export const selectAuditAction: Action = {
  name: "SELECT_AUDIT_ANCHOR",
  description:
    "Audit a Solana Anchor program for security vulnerabilities before calling it. " +
    "Checks init_if_needed, remaining_accounts, unsafe blocks, .unwrap(), missing signer checks, " +
    "and CI/CD status. Returns a session for purchasing the full SHA-256 verified forensic dossier (25 USDC).",
  similes: [
    "audit anchor program",
    "check program security",
    "scan solana program",
    "security review anchor",
    "check smart contract vulnerabilities",
  ],
  examples: [
    [
      {
        input: { repo: "coral-xyz/anchor" },
        output: {
          status: "success",
          sessionId: "h2m-1234567890-abc123",
          repo: "coral-xyz/anchor",
          priceUsdc: 25,
          message: "Audit session created. Pay 25 USDC via Solana Pay to receive the full dossier.",
        },
        explanation: "Creates an audit session for the Anchor framework repository",
      },
    ],
  ],

  async handler(_agent: any, input: Record<string, string>) {
    const { repo } = input;
    if (!repo || typeof repo !== "string") {
      throw new Error("Missing required parameter: repo (e.g. 'owner/repo')");
    }

    const r = await fetch(`${BASE_URL}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: r.statusText }));
      throw new Error(`Audit request failed: ${(err as any).error ?? r.statusText}`);
    }

    const data = await r.json() as Record<string, unknown>;

    return {
      status: "success",
      sessionId: data.sessionId,
      repo: data.repo,
      priceUsdc: data.priceUsdc,
      programId: PROGRAM_ID,
      providerWallet: data.providerWallet,
      checkoutUrl: BASE_URL,
      apiCommand: `curl -X POST ${BASE_URL}/api/audit -H "Content-Type: application/json" -d '{"repo":"${repo}"}'`,
      message: `Audit session created for ${data.repo}. Pay ${data.priceUsdc} USDC via Solana Pay at ${BASE_URL} to receive the full SHA-256 verified security dossier.`,
    };
  },
};

export default selectAuditAction;
