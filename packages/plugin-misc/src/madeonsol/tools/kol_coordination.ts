import { SolanaAgentKit } from "solana-agent-kit";

const BASE_URL = "https://madeonsol.com";

async function query(
  path: string,
  params?: Record<string, string | number>,
) {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`MadeOnSol API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function madeonsol_kol_coordination(
  agent: SolanaAgentKit,
  params: { period?: string; min_kols?: number; limit?: number } = {},
) {
  return query(
    "/api/x402/kol/coordination",
    params as Record<string, string | number>,
  );
}
