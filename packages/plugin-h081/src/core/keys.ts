// The agent's keys. One Solana keypair is the whole identity: it pays fees, holds the USDG that goes in and
// comes out, and its 32-byte secret seed derives the shielded account secret (HMAC-SHA256 of a fixed label
// under the seed). Nothing short of the secret key itself reproduces that: a signature the key makes over any
// message, including the label, reveals nothing about the account. Whoever holds the Solana secret key holds
// the shielded balance: use a dedicated, low-balance agent key.
//
// H081_DERIVE_ACCOUNT=1 selects the older construction instead: sha256 of the key's deterministic ed25519
// signature over the label (what the site does with a wallet's Sign-In-With-Solana signature). With it, one
// signature of the label is as good as the key: never pair it with a tool that signs arbitrary messages.
import { existsSync, readFileSync } from "node:fs";
import { ed25519 } from "@noble/curves/ed25519";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { FIELD, mod } from "../sdk/crypto.js";
import { DERIVE_LABEL } from "./constants.js";

/** A Keypair from a JSON byte array (the Solana CLI file format) or a base58 secret key. */
export function parseSecret(text: string, what = "the key"): Keypair {
  const t = text.trim();
  let bytes: Uint8Array;
  if (t.startsWith("[")) {
    let arr: unknown;
    try {
      arr = JSON.parse(t);
    } catch {
      throw new Error(`${what} is not a JSON byte array`);
    }
    if (
      !Array.isArray(arr) ||
      !arr.every((x) => Number.isInteger(x) && x >= 0 && x <= 255)
    ) {
      throw new Error(`${what} is not a JSON byte array`);
    }
    bytes = Uint8Array.from(arr as number[]);
  } else {
    try {
      bytes = bs58.decode(t);
    } catch {
      throw new Error(`${what} is neither base58 nor a JSON byte array`);
    }
  }
  if (bytes.length === 32) {
    return Keypair.fromSeed(bytes);
  }
  if (bytes.length !== 64) {
    throw new Error(
      `${what} must be 64 bytes (secret + public) or a 32-byte seed; got ${bytes.length}`,
    );
  }
  return Keypair.fromSecretKey(bytes);
}

export const KEY_HELP =
  "set H081_SOLANA_KEYPAIR to a Solana keypair JSON file (e.g. ~/.config/solana/agent.json) or H081_SOLANA_KEY to a base58 secret key";

/** The agent key from the environment: H081_SOLANA_KEYPAIR (a path) first, then H081_SOLANA_KEY (the secret itself). */
export function loadKeypair(env: NodeJS.ProcessEnv = process.env): Keypair {
  const path = env.H081_SOLANA_KEYPAIR?.trim();
  if (path) {
    if (!existsSync(path)) {
      throw new Error(`H081_SOLANA_KEYPAIR: no file at ${path}`);
    }
    return parseSecret(
      readFileSync(path, "utf8"),
      `H081_SOLANA_KEYPAIR (${path})`,
    );
  }
  const raw = env.H081_SOLANA_KEY?.trim();
  if (raw) {
    return parseSecret(raw, "H081_SOLANA_KEY");
  }
  throw new Error(`no agent key: ${KEY_HELP}`);
}

/** Whether the environment names an agent key at all. */
export function hasKeyInEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.H081_SOLANA_KEYPAIR?.trim() || env.H081_SOLANA_KEY?.trim(),
  );
}

/**
 * How the shielded account secret comes from the agent key: `seed` (default) is HMAC-SHA256 of the label under
 * the key's 32-byte seed; `signature` (H081_DERIVE_ACCOUNT=1) is sha256 of the key's ed25519 signature over
 * the label.
 */
export type AccountDerivation = "seed" | "signature";

/** Where the account secret came from: H081_ACCOUNT_SK (`env`) or one of the derivations. */
export type AccountSource = "env" | AccountDerivation;

/** Short text for a tool result or a log line: what holding a given secret or signature means. */
export const ACCOUNT_SOURCE_NOTES: Record<AccountSource, string> = {
  seed: "derived from the agent key's secret seed (HMAC of a fixed label): no signature the key makes reveals it; whoever holds the key holds the shielded balance",
  signature: `derived from the agent key's ed25519 signature over "${DERIVE_LABEL}" (H081_DERIVE_ACCOUNT=1): anyone who obtains that one signature holds the shielded balance; never let a message-signing tool sign it`,
  env: "H081_ACCOUNT_SK: whoever holds that value (and the agent key for fees) holds the shielded balance",
};

const fieldFromHash = (h: Uint8Array): bigint => {
  const k = mod(BigInt("0x" + Buffer.from(h).toString("hex")));
  h.fill(0);
  return k === 0n ? 1n : k;
};

/**
 * The shielded account secret of a Solana keypair, bound to its secret seed: a field element from
 * HMAC-SHA256(key = the 32-byte seed, message = `label`). The same key always opens the same account and
 * nothing has to be stored; nothing a signing tool can produce from the key reproduces it.
 */
export function deriveAccountSk(
  keypair: Keypair,
  label: string = DERIVE_LABEL,
): bigint {
  const seed = keypair.secretKey.subarray(0, 32);
  return fieldFromHash(hmac(sha256, seed, new TextEncoder().encode(label)));
}

/**
 * The signature construction (H081_DERIVE_ACCOUNT=1): sha256 of the keypair's deterministic ed25519 signature
 * over `label`. The signature never leaves the process here, but whoever gets the key to sign that label
 * elsewhere (a wallet, another tool) holds this secret.
 */
export function deriveAccountSkFromSignature(
  keypair: Keypair,
  label: string = DERIVE_LABEL,
): bigint {
  const seed = keypair.secretKey.subarray(0, 32);
  const sig = ed25519.sign(new TextEncoder().encode(label), seed);
  const k = fieldFromHash(sha256(sig));
  sig.fill(0);
  return k;
}

/** Agent sub-account `index` (what a pledge is granted to), from the same key under its own label, by the same derivation. */
export function deriveAgentSk(
  keypair: Keypair,
  index: number,
  derivation: AccountDerivation = "seed",
): bigint {
  if (!Number.isInteger(index) || index < 0 || index > 15) {
    throw new Error("agent index must be 0..15");
  }
  const label = `${DERIVE_LABEL}/agent/${index}`;
  return derivation === "signature"
    ? deriveAccountSkFromSignature(keypair, label)
    : deriveAccountSk(keypair, label);
}

/** A field element from decimal or 0x-hex text. */
export function parseFieldElement(
  text: string,
  what = "H081_ACCOUNT_SK",
): bigint {
  const t = text.trim();
  let x: bigint;
  if (/^0x[0-9a-fA-F]+$/.test(t)) {
    x = BigInt(t);
  } else if (/^\d+$/.test(t)) {
    x = BigInt(t);
  } else {
    throw new Error(`${what} must be a decimal or 0x hex integer`);
  }
  if (x <= 0n || x >= FIELD) {
    throw new Error(`${what} must be in 1..${FIELD - 1n}`);
  }
  return x;
}

/** The derivation the environment asks for: `signature` with H081_DERIVE_ACCOUNT=1 (or `signature`), else `seed`. */
export function accountDerivationFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): AccountDerivation {
  const v = env.H081_DERIVE_ACCOUNT?.trim().toLowerCase();
  if (!v || v === "0" || v === "false" || v === "seed") {
    return "seed";
  }
  if (v === "1" || v === "true" || v === "signature") {
    return "signature";
  }
  throw new Error(
    "H081_DERIVE_ACCOUNT must be unset, 1 (signature derivation) or 0",
  );
}

/**
 * The shielded account secret for `keypair`: H081_ACCOUNT_SK when set, else derived (`derivation` says how,
 * and also how the sub-accounts are derived). `derived` is false only for H081_ACCOUNT_SK.
 */
export function accountSkFromEnv(
  keypair: Keypair,
  env: NodeJS.ProcessEnv = process.env,
): {
  sk: bigint;
  derived: boolean;
  source: AccountSource;
  derivation: AccountDerivation;
} {
  const derivation = accountDerivationFromEnv(env);
  const raw = env.H081_ACCOUNT_SK?.trim();
  if (raw) {
    return {
      sk: parseFieldElement(raw),
      derived: false,
      source: "env",
      derivation,
    };
  }
  const sk =
    derivation === "signature"
      ? deriveAccountSkFromSignature(keypair)
      : deriveAccountSk(keypair);
  return { sk, derived: true, source: derivation, derivation };
}
