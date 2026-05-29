import { Keypair, PublicKey } from "@solana/web3.js";
import bs58Mod from "bs58";
import { AgentFuel, type Cluster } from "@agent-fuel/sdk";
import type { SolanaAgentKit } from "solana-agent-kit";

// bs58 v6 ships ESM-default-only; when this bundle is loaded in CJS context
// the default lands one level deeper. Normalize so `.decode` is always there.
const bs58: { decode: (s: string) => Uint8Array } =
  (bs58Mod as any)?.decode ? (bs58Mod as any) : (bs58Mod as any).default;

/**
 * Pay a service through an Agent Fuel vault.
 *
 * Agent Fuel separates two identities: the **owner** (long-lived wallet that
 * funds the vault — here, the Agent Kit's wallet) and the **agent** (hot
 * keypair that signs spends and accrues reputation). The agent keypair is
 * loaded from `AGENT_FUEL_AGENT_KEYPAIR` (base58 secret or JSON byte array).
 * The vault PDA is derived from `(owner, agent)`.
 *
 * @param agent     SolanaAgentKit instance (its wallet is the vault owner)
 * @param service   Service pubkey to pay (base58)
 * @param amountUsdc Amount in micro-USDC (1 USDC = 1_000_000)
 * @returns         { signature } of the on-chain spend
 */
export async function agentFuelSpend(
  agent: SolanaAgentKit,
  service: string,
  amountUsdc: number,
): Promise<{ signature: string }> {
  const agentKp = loadAgentKeypair();
  const apiBase = process.env.AGENT_FUEL_API_BASE ?? "https://api.agentfuel.online";
  const cluster = (process.env.AGENT_FUEL_CLUSTER ?? "devnet") as Cluster;

  const af = new AgentFuel({
    agent: agentKp,
    cluster,
    rpc: agent.connection,
    owner: agent.wallet.publicKey,
    apiBase,
  });

  return af.spend({ service: new PublicKey(service), amountUsdc });
}

function loadAgentKeypair(): Keypair {
  const raw = process.env.AGENT_FUEL_AGENT_KEYPAIR;
  if (!raw) {
    throw new Error(
      "AGENT_FUEL_AGENT_KEYPAIR is not set. Provide the agent's secret key " +
        "(base58 string or JSON byte array) in the environment.",
    );
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(trimmed) as number[]));
  }
  return Keypair.fromSecretKey(bs58.decode(trimmed));
}
