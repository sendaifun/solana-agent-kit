// Hand-over codes between a lender and a borrower, byte-for-byte the site's encoding
// (stipend-site/src/lib/live/bank.ts): JSON with bigints, keys and bytes tagged, base64url, prefixed.
//   h081-loan-terms:  { v: 1, cluster, program, mint, lender, loanRef, pledgeBps, lenderViewPub }   (lender -> borrower)
//   h081-loan-proof:  { v: 1, cluster, program, ref, payout, proof: {a, b, c}, args: StreamArgs }     (borrower -> lender)
import { PublicKey } from "@solana/web3.js";
import type { SolidityProof } from "../sdk/prover.js";
import type { StreamArgs } from "../sdk/solana/program.js";

export const TERMS_PREFIX = "h081-loan-terms:";
export const PROOF_PREFIX = "h081-loan-proof:";

const hex = (b: Uint8Array) =>
  Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

export function tag(v: unknown): unknown {
  if (typeof v === "bigint") {
    return { $b: v.toString() };
  }
  if (v instanceof Uint8Array) {
    return { $u: hex(v) };
  }
  const k = v as { toBase58?: unknown; toBytes?: unknown };
  if (
    v &&
    typeof k.toBase58 === "function" &&
    typeof k.toBytes === "function"
  ) {
    return { $k: (k.toBase58 as () => string)() };
  }
  if (Array.isArray(v)) {
    return v.map(tag);
  }
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([key, x]) => [
        key,
        tag(x),
      ]),
    );
  }
  return v;
}

export function untag(v: unknown): unknown {
  if (Array.isArray(v)) {
    return v.map(untag);
  }
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.$b === "string") {
      return BigInt(o.$b);
    }
    if (typeof o.$k === "string") {
      return new PublicKey(o.$k);
    }
    if (typeof o.$u === "string") {
      return Uint8Array.from(o.$u.match(/../g) ?? [], (h: string) =>
        parseInt(h, 16),
      );
    }
    return Object.fromEntries(
      Object.entries(o).map(([key, x]) => [key, untag(x)]),
    );
  }
  return v;
}

const b64u = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64u = (s: string) => Buffer.from(s, "base64url").toString("utf8");

export function encodeCode(prefix: string, obj: unknown): string {
  return prefix + b64u(JSON.stringify(tag(obj)));
}

export function decodeCode<T = unknown>(
  prefix: string,
  code: string,
  what: string,
): T {
  const t = String(code).trim();
  if (!t.startsWith(prefix)) {
    throw new Error(
      `That is not a ${what} (it should start with "${prefix}").`,
    );
  }
  try {
    return untag(JSON.parse(unb64u(t.slice(prefix.length)))) as T;
  } catch {
    throw new Error(`That ${what} is damaged; copy it again.`);
  }
}

export interface LoanTermsCode {
  v: number;
  cluster: string;
  program: string;
  mint: string;
  lender: PublicKey;
  loanRef: bigint;
  pledgeBps: bigint;
  lenderViewPub: Uint8Array;
}

export interface LoanProofCode {
  v: number;
  cluster: string;
  program: string;
  ref: bigint;
  payout: PublicKey;
  proof: SolidityProof;
  args: StreamArgs;
}

export const encodeTerms = (t: LoanTermsCode): string =>
  encodeCode(TERMS_PREFIX, t);
export const encodeProofCode = (p: LoanProofCode): string =>
  encodeCode(PROOF_PREFIX, p);

export function decodeTerms(code: string): LoanTermsCode {
  const t = decodeCode<Partial<LoanTermsCode>>(
    TERMS_PREFIX,
    code,
    "loan terms code",
  );
  if (
    !(t.lender instanceof PublicKey) ||
    typeof t.loanRef !== "bigint" ||
    typeof t.pledgeBps !== "bigint" ||
    !(t.lenderViewPub instanceof Uint8Array)
  ) {
    throw new Error(
      "That loan terms code is incomplete (lender, loanRef, pledgeBps and lenderViewPub are needed).",
    );
  }
  return t as LoanTermsCode;
}

export function decodeProofCode(code: string): LoanProofCode {
  const p = decodeCode<Partial<LoanProofCode>>(
    PROOF_PREFIX,
    code,
    "borrower proof code",
  );
  if (
    typeof p.ref !== "bigint" ||
    !(p.payout instanceof PublicKey) ||
    !p.proof ||
    !p.args
  ) {
    throw new Error("That borrower proof code is incomplete.");
  }
  return p as LoanProofCode;
}
