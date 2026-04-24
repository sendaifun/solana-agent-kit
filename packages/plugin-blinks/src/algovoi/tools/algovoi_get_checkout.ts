import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Fetch the AlgoVoi Actions metadata (GET) for a checkout token.
 *
 * Useful for agents that want to inspect the amount, mint, expiry,
 * and disabled state BEFORE asking the user to sign. Returns the
 * spec-compliant ActionGetResponse shape.
 *
 * Unlike `algovoi_pay_checkout`, this never signs or broadcasts.
 */
export async function algovoi_get_checkout(
  _agent: SolanaAgentKit,
  tokenOrUrl: string,
  baseUrl: string = "https://api1.ilovechicken.co.uk",
): Promise<AlgoVoiActionMetadata> {
  const url = resolveGetUrl(tokenOrUrl, baseUrl);
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      `AlgoVoi Actions GET failed: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as AlgoVoiActionMetadata;
}

function resolveGetUrl(tokenOrUrl: string, baseUrl: string): string {
  const s = tokenOrUrl.trim();
  if (s.startsWith("https://") || s.startsWith("http://")) {
    if (s.includes("/actions/checkout/")) return s;
    const match = s.match(/\/checkout\/([^/?#]+)/);
    if (match) {
      const u = new URL(s);
      return `${u.protocol}//${u.host}/actions/checkout/${match[1]}`;
    }
    return s;
  }
  if (s.startsWith("solana-action:")) {
    return decodeURIComponent(s.slice("solana-action:".length));
  }
  return `${baseUrl.replace(/\/$/, "")}/actions/checkout/${encodeURIComponent(s)}`;
}

export interface AlgoVoiActionMetadata {
  type: "action";
  icon: string;
  label: string;
  title: string;
  description: string;
  disabled: boolean;
  error?: { message: string };
}
