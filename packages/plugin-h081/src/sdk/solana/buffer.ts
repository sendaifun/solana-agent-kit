import { randomBytes } from "@noble/hashes/utils";
// Uploading payloads larger than a transaction into a stipend_pool Buffer, and sending helpers.
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SendTransactionError,
  Transaction,
  TransactionError,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { bufferPda } from "./pda.js";
import {
  BUFFER_GROW_STEP,
  BUFFER_MAX_INIT,
  BUFFER_MAX_LEN,
  bufferCloseIx,
  bufferGrowIx,
  bufferOpenIx,
  bufferWriteIx,
} from "./program.js";
import { sendLegacy } from "./send.js";

/** Bytes per buffer_write; keeps each transaction well under the 1,232-byte limit. */
export const WRITE_CHUNK = 900;

export interface SentTx {
  signature: string;
  computeUnits: number;
  logs: string[];
}

/**
 * Sends `ixs` with a measured compute-unit limit and a priority fee, rebroadcasting until confirmed (send.ts),
 * and returns the consumed compute units from the confirmed tx. `opts.cuLimit` is accepted for callers; the
 * limit is measured by simulation.
 */
export async function send(
  connection: Connection,
  payer: Keypair,
  ixs: TransactionInstruction[],
  opts: { cuLimit?: number; signers?: Keypair[] } = {},
): Promise<SentTx> {
  const signature = await sendLegacy(
    connection,
    payer,
    [payer, ...(opts.signers ?? [])],
    ixs,
  );
  const info = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  return {
    signature,
    computeUnits: info?.meta?.computeUnitsConsumed ?? -1,
    logs: info?.meta?.logMessages ?? [],
  };
}

/** Simulates `ixs` and returns the error (null on success), logs and units consumed. */
export async function simulate(
  connection: Connection,
  payer: Keypair,
  ixs: TransactionInstruction[],
  cuLimit = 1_400_000,
  signers: Keypair[] = [],
): Promise<{
  err: TransactionError | null;
  logs: string[];
  computeUnits: number;
}> {
  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: cuLimit }),
    ...ixs,
  );
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (
    await connection.getLatestBlockhash("confirmed")
  ).blockhash;
  tx.sign(payer, ...signers);
  const res = await connection.simulateTransaction(tx);
  return {
    err: res.value.err,
    logs: res.value.logs ?? [],
    computeUnits: res.value.unitsConsumed ?? -1,
  };
}

/** Extracts the Anchor custom error code from a failed send, if any. */
export function customErrorCode(e: unknown): number | undefined {
  const msg =
    e instanceof SendTransactionError
      ? `${e.message} ${(e.logs ?? []).join(" ")}`
      : String(e);
  const m =
    /custom program error: 0x([0-9a-f]+)/i.exec(msg) ??
    /Error Number: (\d+)/.exec(msg);
  if (!m) {
    return undefined;
  }
  return m[0].startsWith("custom") ? parseInt(m[1], 16) : parseInt(m[1], 10);
}

export function randomSeed(): bigint {
  const b = randomBytes(8);
  return new DataView(b.buffer, b.byteOffset, 8).getBigUint64(0, true);
}

export interface UploadedBuffer {
  address: PublicKey;
  seed: bigint;
  signatures: string[];
}

/** Opens a buffer sized to `payload` and writes it in chunks. The caller closes it (or the operation does). */
export async function uploadBuffer(
  connection: Connection,
  programId: PublicKey,
  authority: Keypair,
  payload: Uint8Array,
  seed = randomSeed(),
): Promise<UploadedBuffer> {
  if (payload.length === 0 || payload.length > BUFFER_MAX_LEN) {
    throw new Error(`payload must be 1..${BUFFER_MAX_LEN} bytes`);
  }
  const signatures: string[] = [];
  const first = payload.subarray(
    0,
    Math.min(WRITE_CHUNK - 100, payload.length),
  );
  // open + first chunk in one transaction
  signatures.push(
    (
      await send(connection, authority, [
        bufferOpenIx(programId, authority.publicKey, seed, payload.length),
        bufferWriteIx(programId, authority.publicKey, seed, 0, first),
      ])
    ).signature,
  );
  // grow past the 10 KiB a CPI-created account starts with (8 grow instructions per transaction)
  const grows = Math.max(
    0,
    Math.ceil((payload.length - BUFFER_MAX_INIT) / BUFFER_GROW_STEP),
  );
  for (let g = 0; g < grows; g += 8) {
    const n = Math.min(8, grows - g);
    signatures.push(
      (
        await send(
          connection,
          authority,
          Array.from({ length: n }, () =>
            bufferGrowIx(programId, authority.publicKey, seed),
          ),
        )
      ).signature,
    );
  }
  const offsets: number[] = [];
  for (let off = first.length; off < payload.length; off += WRITE_CHUNK) {
    offsets.push(off);
  }
  // bounded concurrency
  for (let i = 0; i < offsets.length; i += 16) {
    const batch = offsets
      .slice(i, i + 16)
      .map((off) =>
        send(connection, authority, [
          bufferWriteIx(
            programId,
            authority.publicKey,
            seed,
            off,
            payload.subarray(off, off + WRITE_CHUNK),
          ),
        ]),
      );
    for (const s of await Promise.all(batch)) {
      signatures.push(s.signature);
    }
  }
  return {
    address: bufferPda(programId, authority.publicKey, seed),
    seed,
    signatures,
  };
}

export async function closeBuffer(
  connection: Connection,
  programId: PublicKey,
  authority: Keypair,
  seed: bigint,
): Promise<SentTx> {
  return send(connection, authority, [
    bufferCloseIx(programId, authority.publicKey, seed),
  ]);
}
