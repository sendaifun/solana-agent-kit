import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { OnleashClient, policyPda } from "@onleash/sdk";
import { PublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Get or create an OnleashClient from a SolanaAgentKit instance.
 * The agent's connection and wallet are reused — no extra config needed.
 */
export function getOnleashClient(agent: SolanaAgentKit): OnleashClient {
  const provider = new AnchorProvider(
    agent.connection,
    agent.wallet as unknown as Wallet,
    { commitment: "confirmed" },
  );
  return new OnleashClient(agent.connection, provider.wallet);
}

export async function deployProtectedMint(
  agent: SolanaAgentKit,
  params: {
    decimals: number;
    perTxMax: bigint;
    dailyCap: bigint;
    allowlist: string[];
  },
) {
  const client = getOnleashClient(agent);
  const result = await client.deployProtectedMint({
    decimals: params.decimals,
    perTxMax: params.perTxMax,
    dailyCap: params.dailyCap,
    allowlist: params.allowlist.map((s) => new PublicKey(s)),
  });
  return {
    mint: result.mint.toBase58(),
    policy: result.policy.toBase58(),
    metaList: result.metaList.toBase58(),
    signatures: result.signatures,
  };
}

export async function updatePolicy(
  agent: SolanaAgentKit,
  params: {
    mint: string;
    perTxMax?: bigint | null;
    dailyCap?: bigint | null;
    allowlist?: string[] | null;
  },
) {
  const client = getOnleashClient(agent);
  const mint = new PublicKey(params.mint);
  const ix = await client.ixUpdatePolicy({
    authority: agent.wallet.publicKey,
    mint,
    perTxMax: params.perTxMax ?? null,
    dailyCap: params.dailyCap ?? null,
    allowlist: params.allowlist
      ? params.allowlist.map((s) => new PublicKey(s))
      : null,
  });
  const { Transaction, sendAndConfirmTransaction } = await import(
    "@solana/web3.js"
  );
  const sig = await sendAndConfirmTransaction(
    agent.connection,
    new Transaction().add(ix),
    [(agent.wallet as any).payer],
  );
  return { signature: sig };
}

export async function getPolicy(agent: SolanaAgentKit, mint: string) {
  const client = getOnleashClient(agent);
  const policy = await client.tryFetchPolicy(new PublicKey(mint));
  if (!policy) return null;
  return {
    authority: policy.authority.toBase58(),
    mint: policy.mint.toBase58(),
    perTxMax: policy.perTxMax.toString(),
    dailyCap: policy.dailyCap.toString(),
    dayStartUnix: policy.dayStartUnix.toString(),
    spentToday: policy.spentToday.toString(),
    destinationAllowlist: policy.destinationAllowlist.map((p: PublicKey) =>
      p.toBase58(),
    ),
  };
}

export async function protectedTransfer(
  agent: SolanaAgentKit,
  params: {
    mint: string;
    source: string;
    destination: string;
    amount: bigint;
    decimals: number;
  },
) {
  const client = getOnleashClient(agent);
  return client.transfer({
    mint: new PublicKey(params.mint),
    source: new PublicKey(params.source),
    destination: new PublicKey(params.destination),
    owner: (agent.wallet as any).payer,
    amount: params.amount,
    decimals: params.decimals,
  });
}
