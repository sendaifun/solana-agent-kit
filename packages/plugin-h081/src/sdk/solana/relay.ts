// Relayer payloads for stipend_pool: what a wallet hands a relayer, and the decoders and checks the relayer
// runs before it spends anything. A payload is exactly what the SDK stages in a Buffer, `borsh(Proof, Args,
// ext)`; the relayer stages it under its own key and sends the operation as payer (the program requires the
// payer to be the buffer's authority). extDataHash binds the fee, the relayer pubkey and the fee token
// account, so a relayer cannot change who is paid, and a wallet cannot point the fee anywhere the relayer
// did not agree to (the relayer refuses it here).
import { sha256 } from "@noble/hashes/sha2";
import { PublicKey } from "@solana/web3.js";
import { fromBe } from "./field.js";
import { DELEGATE_OUTPUTS, GRANT_OUTPUTS, extDataHash } from "./ops.js";

export const PROOF_BYTES = 256;
export const TRANSACT_ARGS_BYTES = 7 * 32;
export const SPEND_ARGS_BYTES =
  4 * 32 + 16 + 32 + 32 + 16 + 8 + 32 + 16 + 32 + 8 + 1 + 32;
export const GRANT_ARGS_BYTES = (1 + 2 + GRANT_OUTPUTS + 1 + 1 + 1) * 32;
export const DELEGATE_ARGS_BYTES = (2 + DELEGATE_OUTPUTS + 1) * 32 + 8 + 32;

export type SolanaOp = "transact" | "spend" | "grant" | "delegate";
export const SOLANA_OPS: readonly SolanaOp[] = [
  "transact",
  "spend",
  "grant",
  "delegate",
];

/**
 * What a wallet sends to a relayer (POST /v1/solana/relay). Account hints are optional: the relayer derives
 * every account it can from the payload and checks the hints it uses.
 */
export interface SolanaRelayRequest {
  op: SolanaOp;
  /** base64 of the staged payload: proof (256 B) | args | ext */
  payload: string;
  /** the SPL mint; required by transact when tokens move (the transact args do not name it) */
  mint?: string;
  /** wallet that owns the payout ATA (transact withdrawal), so the relayer can create the ATA idempotently */
  recipientOwner?: string;
  /** the lender's ATA for a pledged spend; the relayer falls back to the escrow when it cannot take the share */
  lenderToken?: string;
  /**
   * Capacity operator (base58): a wallet with H081 staked in capacity_stake whose 30-day relayed volume this
   * operation counts against. A relayer that enforces capacity requires one when the public amount is above
   * its anonymous free tier. The relayer learns the operator; the chain does not.
   */
  operator?: string;
  /** base64 ed25519 signature by `operator` over capacityMessage(payload) */
  operatorSig?: string;
}

/** What an operator signs (ed25519) to put an operation on its capacity: a domain tag and sha256 of the payload. */
export function capacityMessage(payload: Uint8Array): Uint8Array {
  const tag = new TextEncoder().encode("h081-relay-capacity:v1:");
  const out = new Uint8Array(tag.length + 32);
  out.set(tag);
  out.set(sha256(payload), tag.length);
  return out;
}

export class PayloadError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

class Reader {
  o = 0;
  constructor(readonly b: Uint8Array) {}
  take(n: number): Uint8Array {
    if (this.o + n > this.b.length) {
      throw new PayloadError(
        "payload_truncated",
        `payload ends at ${this.b.length}, needed ${this.o + n}`,
      );
    }
    const out = this.b.subarray(this.o, this.o + n);
    this.o += n;
    return out;
  }
  f(): bigint {
    return fromBe(this.take(32));
  }
  key(): PublicKey {
    return new PublicKey(this.take(32));
  }
  u8(): number {
    return this.take(1)[0];
  }
  u32(): number {
    const t = this.take(4);
    return new DataView(t.buffer, t.byteOffset, 4).getUint32(0, true);
  }
  u64(): bigint {
    const t = this.take(8);
    return new DataView(t.buffer, t.byteOffset, 8).getBigUint64(0, true);
  }
  u128(): bigint {
    const t = this.take(16);
    let x = 0n;
    for (let i = 15; i >= 0; i--) {
      x = (x << 8n) | BigInt(t[i]);
    }
    return x;
  }
  i128(): bigint {
    return BigInt.asIntN(128, this.u128());
  }
  vec(): Uint8Array {
    return this.take(this.u32());
  }
  done(): void {
    if (this.o !== this.b.length) {
      throw new PayloadError(
        "payload_trailing",
        `${this.b.length - this.o} trailing bytes`,
      );
    }
  }
}

export interface DecodedTransact {
  op: "transact";
  root: bigint;
  publicAmount: bigint;
  extDataHash: bigint;
  nullifiers: [bigint, bigint];
  commitments: [bigint, bigint];
  recipient: PublicKey;
  relayer: PublicKey;
  feeRecipient: PublicKey;
  extAmount: bigint;
  fee: bigint;
}
export interface DecodedSpend {
  op: "spend";
  root: bigint;
  nullifier: bigint;
  publicAmount: bigint;
  publicRecipient: PublicKey;
  publicAsset: PublicKey;
  fee: bigint;
  timestamp: bigint;
  lenderAmount: bigint;
  lenderAddr: bigint;
  loanRef: bigint;
  isLenderClaim: boolean;
  extDataHash: bigint;
  relayer: PublicKey;
  feeRecipient: PublicKey;
}
export interface DecodedGrant {
  op: "grant";
  root: bigint;
  nullifiers: [bigint, bigint];
  extDataHash: bigint;
}
export interface DecodedDelegate {
  op: "delegate";
  root: bigint;
  nullifier: bigint;
  timestamp: bigint;
  extDataHash: bigint;
}
export type DecodedOp =
  | DecodedTransact
  | DecodedSpend
  | DecodedGrant
  | DecodedDelegate;

/**
 * Decodes a staged payload and checks that its extDataHash matches the ext bytes (the program checks the
 * same; doing it here costs nothing and refuses junk before anything is staged).
 */
export function decodeRelayPayload(
  op: SolanaOp,
  payload: Uint8Array,
): DecodedOp {
  const r = new Reader(payload);
  r.take(PROOF_BYTES);
  let out: DecodedOp;
  const argsEnd =
    PROOF_BYTES +
    (
      {
        transact: TRANSACT_ARGS_BYTES,
        spend: SPEND_ARGS_BYTES,
        grant: GRANT_ARGS_BYTES,
        delegate: DELEGATE_ARGS_BYTES,
      } as const
    )[op];
  if (op === "transact") {
    const root = r.f(),
      publicAmount = r.f(),
      h = r.f();
    const nullifiers: [bigint, bigint] = [r.f(), r.f()];
    const commitments: [bigint, bigint] = [r.f(), r.f()];
    const recipient = r.key(),
      relayer = r.key(),
      feeRecipient = r.key(),
      extAmount = r.i128(),
      fee = r.u128();
    r.vec();
    r.vec();
    out = {
      op,
      root,
      publicAmount,
      extDataHash: h,
      nullifiers,
      commitments,
      recipient,
      relayer,
      feeRecipient,
      extAmount,
      fee,
    };
  } else if (op === "spend") {
    const root = r.f(),
      nullifier = r.f();
    r.f();
    r.f(); // successor and payout commitments
    const publicAmount = r.u128(),
      publicRecipient = r.key(),
      publicAsset = r.key(),
      fee = r.u128(),
      timestamp = r.u64();
    r.f(); // receipt
    const lenderAmount = r.u128(),
      lenderAddr = r.f(),
      loanRef = r.u64(),
      isLenderClaim = r.u8() === 1,
      h = r.f();
    const relayer = r.key(),
      feeRecipient = r.key();
    r.vec();
    r.vec();
    r.vec();
    out = {
      op,
      root,
      nullifier,
      publicAmount,
      publicRecipient,
      publicAsset,
      fee,
      timestamp,
      lenderAmount,
      lenderAddr,
      loanRef,
      isLenderClaim,
      extDataHash: h,
      relayer,
      feeRecipient,
    };
  } else if (op === "grant") {
    const root = r.f();
    const nullifiers: [bigint, bigint] = [r.f(), r.f()];
    for (let i = 0; i < GRANT_OUTPUTS + 2; i++) {
      r.f();
    }
    const h = r.f();
    for (let i = 0; i <= GRANT_OUTPUTS; i++) {
      r.vec();
    }
    out = { op, root, nullifiers, extDataHash: h };
  } else if (op === "delegate") {
    const root = r.f(),
      nullifier = r.f();
    for (let i = 0; i <= DELEGATE_OUTPUTS; i++) {
      r.f();
    }
    const timestamp = r.u64(),
      h = r.f();
    for (let i = 0; i <= DELEGATE_OUTPUTS; i++) {
      r.vec();
    }
    out = { op, root, nullifier, timestamp, extDataHash: h };
  } else {
    throw new PayloadError("bad_op", `unknown operation ${String(op)}`);
  }
  r.done();
  if (extDataHash(payload.subarray(argsEnd)) !== out.extDataHash) {
    throw new PayloadError(
      "ext_data_hash",
      "extDataHash does not match the ext bytes",
    );
  }
  return out;
}

/** The nullifier PDAs an operation creates (the relayer checks none exists yet). */
export function nullifiersOf(d: DecodedOp): bigint[] {
  return d.op === "transact" || d.op === "grant"
    ? [...d.nullifiers]
    : [d.nullifier];
}

/** What the relayer is paid, in which mint, and what it must be told to accept it. */
export interface FeeTerms {
  /** the relayer's pubkey (ext.relayer must equal it) */
  relayer: PublicKey;
  /** minimum fee per mint (base58) in base units; a mint missing here is not accepted for paid operations */
  minFees: Map<string, bigint>;
  /** the relayer's fee token account for a mint and its token program (normally its ATA) */
  feeAccount: (mint: PublicKey) => PublicKey;
  /** relay operations that pay no fee (grant, delegate, shielded transfer); default false */
  allowUnpaid?: boolean;
}

export interface FeeCheck {
  paid: boolean;
  mint?: PublicKey;
  fee: bigint;
}

/**
 * Checks what an operation pays the relayer. Refuses: deposits (the depositor must sign the token
 * transfer), lender claims (the lender must sign), a fee to any other relayer key or account, a fee below
 * the configured minimum for the mint, and unpaid operations unless `allowUnpaid`.
 * `mint`: for transact, the mint the request names (bound on chain as fieldOf(mint) through the proof).
 */
export function checkFee(
  d: DecodedOp,
  terms: FeeTerms,
  mint?: PublicKey,
): FeeCheck {
  const unpaid = (): FeeCheck => {
    if (!terms.allowUnpaid) {
      throw new PayloadError(
        "fee_required",
        `${d.op} pays no relayer fee and this relayer does not relay unpaid operations`,
      );
    }
    return { paid: false, fee: 0n };
  };
  if (d.op === "grant" || d.op === "delegate") {
    return unpaid();
  }
  let fee: bigint;
  let feeMint: PublicKey;
  if (d.op === "transact") {
    if (d.extAmount > 0n) {
      throw new PayloadError(
        "deposit_not_relayable",
        "a deposit moves tokens from the payer; send it yourself",
      );
    }
    if (d.fee === 0n) {
      return unpaid(); // a shielded transfer, or a withdrawal that pays nothing
    }
    if (!mint) {
      throw new PayloadError(
        "mint_required",
        "transact with a fee needs the mint",
      );
    }
    fee = d.fee;
    feeMint = mint;
  } else {
    if (d.isLenderClaim) {
      throw new PayloadError(
        "claim_not_relayable",
        "a lender claim must be signed by the lender",
      );
    }
    if (d.fee === 0n || d.publicAmount === 0n) {
      return unpaid();
    }
    if (d.publicAsset.equals(PublicKey.default)) {
      throw new PayloadError("asset_missing", "a paid spend names its mint");
    }
    if (mint && !mint.equals(d.publicAsset)) {
      throw new PayloadError(
        "mint_mismatch",
        "the request mint differs from the spend asset",
      );
    }
    fee = d.fee;
    feeMint = d.publicAsset;
  }
  if (!d.relayer.equals(terms.relayer)) {
    throw new PayloadError(
      "wrong_relayer",
      `ext.relayer is ${d.relayer.toBase58()}, this relayer is ${terms.relayer.toBase58()}`,
    );
  }
  const min = terms.minFees.get(feeMint.toBase58());
  if (min === undefined) {
    throw new PayloadError(
      "asset_not_accepted",
      `fees in ${feeMint.toBase58()} are not accepted`,
    );
  }
  const expected = terms.feeAccount(feeMint);
  if (!d.feeRecipient.equals(expected)) {
    throw new PayloadError(
      "wrong_fee_account",
      `the fee must go to ${expected.toBase58()}`,
    );
  }
  if (fee < min) {
    throw new PayloadError(
      "fee_too_low",
      `fee ${fee} is below the minimum ${min} for ${feeMint.toBase58()}`,
    );
  }
  return { paid: true, mint: feeMint, fee };
}

export const toB64 = (b: Uint8Array) =>
  Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString("base64");
export const fromB64 = (s: string) => {
  if (typeof s !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(s)) {
    throw new PayloadError("bad_payload", "payload must be base64");
  }
  return new Uint8Array(Buffer.from(s, "base64"));
};
