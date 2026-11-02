// Field encodings shared with the stipend_pool program (docs/SOLANA-PORT.md section 2).
import { sha256 } from "@noble/hashes/sha2";
import type { PublicKey } from "@solana/web3.js";
import type { SolidityProof } from "../prover.js";

/** BN254 scalar field (the circuits' field). */
export const FIELD_R =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;
/** BN254 base field; G1 coordinates live here. */
export const FIELD_Q =
  21888242871839275222246405745257275088696311157297823662689037894645226208583n;

/** fieldOf(pubkey) = big-endian integer of sha256(pubkey bytes)[0..20]: 160 bits, always < r. */
export function fieldOf(key: PublicKey | Uint8Array): bigint {
  const bytes = key instanceof Uint8Array ? key : key.toBytes();
  if (bytes.length !== 32) {
    throw new Error("fieldOf expects a 32-byte public key");
  }
  const h = sha256(bytes).subarray(0, 20);
  let x = 0n;
  for (const b of h) {
    x = (x << 8n) | BigInt(b);
  }
  return x;
}

/** 32-byte big-endian encoding of a non-negative integer below 2^256. */
export function be32(x: bigint): Uint8Array {
  if (x < 0n || x >= 1n << 256n) {
    throw new Error("be32 out of range");
  }
  const out = new Uint8Array(32);
  let v = x;
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

export function fromBe(bytes: Uint8Array): bigint {
  let x = 0n;
  for (const b of bytes) {
    x = (x << 8n) | BigInt(b);
  }
  return x;
}

/**
 * Encodes a snarkjs proof (as Prover.prove returns it: `b` already in EIP-197 c1,c0 order) for the
 * program: a (negated: x, q - y) 64 B | b 128 B | c 64 B, all big-endian. 256 bytes.
 */
export function encodeProof(p: SolidityProof): Uint8Array {
  const out = new Uint8Array(256);
  const [ax, ay] = p.a;
  const negY = ay === 0n ? 0n : FIELD_Q - (ay % FIELD_Q);
  out.set(be32(ax), 0);
  out.set(be32(negY), 32);
  out.set(be32(p.b[0][0]), 64);
  out.set(be32(p.b[0][1]), 96);
  out.set(be32(p.b[1][0]), 128);
  out.set(be32(p.b[1][1]), 160);
  out.set(be32(p.c[0]), 192);
  out.set(be32(p.c[1]), 224);
  return out;
}

/** Borsh `Vec<[u8; 32]>` of field elements. */
export function encodeFieldVec(xs: bigint[]): Uint8Array {
  const out = new Uint8Array(4 + 32 * xs.length);
  new DataView(out.buffer).setUint32(0, xs.length, true);
  xs.forEach((x, i) => {
    if (x >= FIELD_R) {
      throw new Error("public input not in field");
    }
    out.set(be32(x), 4 + 32 * i);
  });
  return out;
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function u64le(x: bigint | number): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, BigInt(x), true);
  return out;
}

export function u32le(x: number): Uint8Array {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, x, true);
  return out;
}

export function u16le(x: number): Uint8Array {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, x, true);
  return out;
}
