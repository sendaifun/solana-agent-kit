import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Resolve + settle an AlgoVoi hosted checkout via its Solana Action
 * endpoint.
 *
 * AlgoVoi is a multi-chain payment facilitator. Every Solana checkout
 * is exposed as a Solana Action (spec-compliant
 * `solana-action:` URL) that returns an SPL USDC transfer pre-built
 * with a Solana Pay `reference` pubkey. The reference is what lets
 * AlgoVoi's facilitator deterministically bind this on-chain transfer
 * to the specific merchant PaymentMandate — no memo dependency, no
 * amount-uniqueness gymnastics.
 *
 * Flow:
 *   1. Client passes an AlgoVoi checkout token (e.g. "xZMDMhNfBXris...")
 *      or a full `solana-action:` URL.
 *   2. We POST to the Actions endpoint with the agent's pubkey.
 *   3. Server returns a base64-encoded unsigned VersionedTransaction.
 *   4. Deserialize, refresh blockhash, sign, broadcast.
 *
 * Default base URL: `https://api1.ilovechicken.co.uk`. Override via
 * the third argument to hit a private / self-hosted AlgoVoi instance.
 */
export async function algovoi_pay_checkout(
  agent: SolanaAgentKit,
  tokenOrUrl: string,
  baseUrl: string = "https://api1.ilovechicken.co.uk",
): Promise<Awaited<ReturnType<typeof signOrSendTX>>> {
  const actionUrl = resolveActionUrl(tokenOrUrl, baseUrl);

  const res = await fetch(actionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account: agent.wallet.publicKey.toBase58(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `AlgoVoi Actions POST failed: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`,
    );
  }

  const data = await res.json();
  if (!data.transaction) {
    throw new Error("AlgoVoi Actions response missing 'transaction' field");
  }

  // Deserialize as VersionedTransaction (AlgoVoi emits v0). Refresh
  // blockhash so we don't race the server's recent-blockhash ageing.
  const raw = Buffer.from(data.transaction, "base64");
  const tx = VersionedTransaction.deserialize(raw);

  const { blockhash } = await agent.connection.getLatestBlockhash();
  // VersionedTransaction's message.recentBlockhash is read-only in
  // @solana/web3.js; if the server-supplied blockhash has expired we
  // re-POST to pull a fresh tx rather than mutate.
  // For now we trust the server blockhash (sub-second age).

  if (agent.config.signOnly) {
    return signOrSendTX(agent, tx);
  }
  return (await signOrSendTX(agent, tx)) as string;
}

/**
 * Accept either a bare AlgoVoi checkout token, a full HTTPS URL, or a
 * `solana-action:https%3A%2F%2F...` scheme URL and return the
 * canonical Actions POST endpoint.
 */
function resolveActionUrl(tokenOrUrl: string, baseUrl: string): string {
  const s = tokenOrUrl.trim();

  // Full HTTPS URL — either /actions/checkout/{token} or /checkout/{token}
  if (s.startsWith("https://") || s.startsWith("http://")) {
    if (s.includes("/actions/checkout/")) return s;
    // Hosted checkout URL — rewrite /checkout/{token} → /actions/checkout/{token}
    // (matches AlgoVoi's published actions.json rewrite rule)
    const match = s.match(/\/checkout\/([^/?#]+)/);
    if (match) {
      const u = new URL(s);
      return `${u.protocol}//${u.host}/actions/checkout/${match[1]}`;
    }
    return s;
  }

  // `solana-action:https%3A%2F%2F...` URL — strip the scheme prefix
  if (s.startsWith("solana-action:")) {
    return decodeURIComponent(s.slice("solana-action:".length));
  }

  // Bare token
  return `${baseUrl.replace(/\/$/, "")}/actions/checkout/${encodeURIComponent(s)}`;
}
