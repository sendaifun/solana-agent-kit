// Which Keypair signs for an agent. The H081 SDK stages proofs in program buffers over several transactions
// and signs each one itself, so it needs a raw Keypair, not a BaseWallet. Order:
//   1. H081_SOLANA_KEYPAIR / H081_SOLANA_KEY in the environment (a dedicated agent key; recommended);
//   2. the Keypair inside a KeypairWallet (reflected off its private `payer` field);
//   3. otherwise a clear error: Privy, Turnkey, Crossmint and other signer-only wallets are not supported in v1.
import { Keypair } from "@solana/web3.js";
import { KeypairWallet, type SolanaAgentKit } from "solana-agent-kit";
import { hasKeyInEnv, loadKeypair } from "./core/keys.js";

export const UNSUPPORTED_WALLET =
  "H081 needs a raw Keypair: the bank stages zero-knowledge proofs in program buffers over several transactions and signs " +
  "each one itself. Set H081_SOLANA_KEYPAIR (a keypair JSON file) or H081_SOLANA_KEY (a base58 secret) to a dedicated " +
  "agent key, or construct the SolanaAgentKit with a KeypairWallet. Privy, Turnkey, Crossmint and other signer-only " +
  "wallets are not supported by this plugin yet.";

/** The Keypair inside a KeypairWallet, or undefined for any other wallet. */
export function keypairOfWallet(wallet: unknown): Keypair | undefined {
  if (!(wallet instanceof KeypairWallet)) {
    return undefined;
  }
  const payer = (wallet as unknown as { payer?: unknown }).payer;
  return payer instanceof Keypair ? payer : undefined;
}

export function signerFromAgent(
  agent: Pick<SolanaAgentKit, "wallet">,
  env: NodeJS.ProcessEnv = process.env,
): Keypair {
  if (hasKeyInEnv(env)) {
    return loadKeypair(env);
  }
  const kp = keypairOfWallet(agent.wallet);
  if (kp) {
    return kp;
  }
  throw new Error(UNSUPPORTED_WALLET);
}
