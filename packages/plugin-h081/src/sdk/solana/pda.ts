// PDA derivations of the stipend_pool program (docs/SOLANA-PORT.md section 3.1).
import { PublicKey } from "@solana/web3.js";
import { be32, u64le } from "./field.js";

const enc = (s: string) => new TextEncoder().encode(s);

/** Pool Merkle state: ["pool"]. */
export function poolPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([enc("pool")], programId)[0];
}

/** Staging buffer: ["buf", authority, seed u64 LE]. */
export function bufferPda(
  programId: PublicKey,
  authority: PublicKey,
  seed: bigint | number,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("buf"), authority.toBytes(), u64le(seed)],
    programId,
  )[0];
}

/** Spent-nullifier marker: ["nf", nullifier 32 B big-endian]. (Next stage.) */
export function nullifierPda(
  programId: PublicKey,
  nullifier: bigint,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("nf"), be32(nullifier)],
    programId,
  )[0];
}

/** Authority of every vault: ["vault_auth"]. (Next stage.) */
export function vaultAuthorityPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([enc("vault_auth")], programId)[0];
}

/** Per-mint vault token account: ["vault", mint]. (Next stage.) */
export function vaultPda(programId: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("vault"), mint.toBytes()],
    programId,
  )[0];
}

/** Undeliverable lender share: ["owed", mint, lender_field 32 B BE, loan_ref u64 LE]. (Next stage.) */
export function escrowPda(
  programId: PublicKey,
  mint: PublicKey,
  lenderField: bigint,
  loanRef: bigint,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("owed"), mint.toBytes(), be32(lenderField), u64le(loanRef)],
    programId,
  )[0];
}

/** Anchor event-cpi authority: ["__event_authority"]. */
export function eventAuthorityPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("__event_authority")],
    programId,
  )[0];
}

/** Deposit guard (config authority, pause flag, default caps): ["config"]. */
export function configPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([enc("config")], programId)[0];
}

/** Per-asset deposit caps: ["cap", mint]. */
export function assetCapPda(programId: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("cap"), mint.toBytes()],
    programId,
  )[0];
}
