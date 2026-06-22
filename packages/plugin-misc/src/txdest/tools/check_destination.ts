import { PublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * A single thing that looks wrong about a destination address.
 */
export interface DestinationFlag {
  /** Stable machine-readable code, e.g. "INVALID_PUBKEY". */
  code: string;
  /** Severity that drives the overall verdict. */
  severity: "warn" | "halt";
  /** Human-readable explanation of the risk. */
  message: string;
}

/**
 * Structured, fail-safe verdict for a transfer destination.
 *
 * `ok` is only `true` for a clean `allow` — any `warn` or `halt` sets it
 * `false` so a caller that only checks `ok` never silently proceeds.
 */
export interface DestinationVerdict {
  ok: boolean;
  verdict: "allow" | "warn" | "halt";
  flags: DestinationFlag[];
  summary: string;
}

/** Options for the deterministic destination check. */
export interface CheckDestinationOptions {
  /**
   * Whether the transfer being guarded is native SOL (as opposed to an SPL
   * token). Used to refine on-curve / system-account warnings. Defaults to
   * `true` because plain SOL transfers are the most common foot-gun.
   */
  isNativeSol?: boolean;
}

/**
 * Well-known on-chain program / system addresses. Transferring funds *to* any
 * of these is almost always a mistake (the value becomes unrecoverable or is
 * simply lost), so we surface them by name.
 */
const KNOWN_ADDRESSES: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "SPL Token Program",
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: "SPL Token-2022 Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL:
    "Associated Token Account Program",
  MemoSq4gq4W8V86CFiK2yPPwj6Wb8gT1n1z4Bz2EHrx: "SPL Memo Program",
  Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo: "SPL Memo Program (v1)",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
  Sysvar1111111111111111111111111111111111111: "Sysvar (system variable)",
  Stake11111111111111111111111111111111111111: "Stake Program",
  Vote111111111111111111111111111111111111111: "Vote Program",
  BPFLoaderUpgradeab1e11111111111111111111111: "BPF Upgradeable Loader",
  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: "Metaplex Token Metadata",
};

/**
 * Burn-shaped addresses: structurally valid-looking but no one holds the key,
 * so funds sent here are gone forever. The all-zeros address is the System
 * Program (handled above); the all-ones address is the canonical "incinerator"
 * shape that agents sometimes produce from a default/placeholder value.
 */
const BURN_SHAPED = new Set<string>([
  "1nc1nerator11111111111111111111111111111111", // SOL incinerator
]);

const failSafe = (message: string): DestinationVerdict => ({
  ok: false,
  verdict: "halt",
  flags: [{ code: "UNPARSEABLE", severity: "halt", message }],
  summary: `⛔ ${message} — refusing to treat destination as safe`,
});

/**
 * @name        checkDestination
 * @description Deterministic, offline safety check for a transfer destination
 *              address. Catches the costly mistakes that happen *before* any
 *              RPC call is even needed: a malformed pubkey, an address that is
 *              not on the ed25519 curve (so no one can ever sign for it), a
 *              known program / system address, or a burn-shaped address.
 *
 *              Never throws. An unparseable address resolves to a `halt`
 *              verdict rather than an exception, so callers that only inspect
 *              the result can never accidentally proceed on bad input.
 * @param       address  The candidate destination address (base58 string).
 * @param       opts     Optional {@link CheckDestinationOptions}.
 * @returns     A structured {@link DestinationVerdict}.
 */
export function checkDestination(
  address: string,
  opts: CheckDestinationOptions = {},
): DestinationVerdict {
  const isNativeSol = opts.isNativeSol ?? true;

  if (typeof address !== "string" || address.trim().length === 0) {
    return failSafe("empty destination address");
  }
  const trimmed = address.trim();

  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(trimmed);
  } catch (error: any) {
    return failSafe(
      `invalid base58 / not a valid Solana address: ${error?.message ?? error}`,
    );
  }

  // PublicKey accepts some inputs that re-serialize differently (e.g. wrong
  // length decoded leniently). Require a canonical round-trip.
  if (pubkey.toBase58() !== trimmed) {
    return failSafe(
      `address is not in canonical base58 form (got "${trimmed}", canonical "${pubkey.toBase58()}")`,
    );
  }

  const flags: DestinationFlag[] = [];
  const base58 = pubkey.toBase58();

  // 1. Known program / system address.
  const knownName = KNOWN_ADDRESSES[base58];
  if (knownName) {
    flags.push({
      code: "KNOWN_PROGRAM_ADDRESS",
      severity: "halt",
      message: `destination is the ${knownName}; transferring funds here is almost certainly a mistake and likely unrecoverable`,
    });
  }

  // 2. Burn-shaped address.
  if (BURN_SHAPED.has(base58)) {
    flags.push({
      code: "BURN_ADDRESS",
      severity: "halt",
      message:
        "destination is a burn / incinerator address; funds sent here are permanently destroyed",
    });
  }

  // 3. Off-curve address. An address not on the ed25519 curve has no
  //    corresponding private key, so for a *native SOL* transfer the recipient
  //    can never move the funds. This is exactly the shape of a PDA / ATA
  //    pasted where a wallet was expected.
  if (!PublicKey.isOnCurve(pubkey.toBytes())) {
    flags.push({
      code: "OFF_CURVE_ADDRESS",
      severity: isNativeSol ? "halt" : "warn",
      message: isNativeSol
        ? "destination is off the ed25519 curve (a program-derived / non-wallet address); a native SOL transfer here would be unrecoverable. If you meant a token account, verify it is the correct ATA."
        : "destination is off the ed25519 curve (likely a token account or PDA); confirm this is the intended account and not a wallet address",
    });
  }

  return verdictFromFlags(flags, base58);
}

/**
 * Collapse a set of flags into a final verdict. `halt` dominates `warn`, which
 * dominates `allow`.
 */
function verdictFromFlags(
  flags: DestinationFlag[],
  base58: string,
): DestinationVerdict {
  if (flags.some((f) => f.severity === "halt")) {
    return {
      ok: false,
      verdict: "halt",
      flags,
      summary: `⛔ unsafe destination (${flags.length} issue${flags.length === 1 ? "" : "s"}) — do not send`,
    };
  }
  if (flags.length > 0) {
    return {
      ok: false,
      verdict: "warn",
      flags,
      summary: `⚠️ destination needs review (${flags.length} warning${flags.length === 1 ? "" : "s"}) — confirm before sending`,
    };
  }
  return {
    ok: true,
    verdict: "allow",
    flags: [],
    summary: `✅ ${base58} looks like a normal, signable wallet address`,
  };
}

/**
 * @name        checkDestinationOnChain
 * @description The deterministic {@link checkDestination} check *plus* RPC
 *              enrichment using the agent's connection. Adds checks that need
 *              chain state: a non-existent / zero-lamport destination (warn),
 *              and — the classic loss — a destination that is itself an SPL
 *              **mint** account (halt; sending SOL or tokens to a mint burns
 *              them). Also warns when sending native SOL to an address owned by
 *              the Token program.
 *
 *              Never throws. If the static check already halts, or if the RPC
 *              call fails, the result stays fail-safe (no silent upgrade to a
 *              clean allow on RPC failure).
 * @param       agent    SolanaAgentKit instance (provides the RPC connection).
 * @param       address  The candidate destination address (base58 string).
 * @param       opts     Optional {@link CheckDestinationOptions}.
 * @returns     A structured {@link DestinationVerdict}.
 */
export async function checkDestinationOnChain(
  agent: SolanaAgentKit,
  address: string,
  opts: CheckDestinationOptions = {},
): Promise<DestinationVerdict> {
  const isNativeSol = opts.isNativeSol ?? true;
  const staticVerdict = checkDestination(address, opts);

  // If the address is already unparseable or a known program/burn address,
  // there is nothing useful (or safe) to add from RPC.
  if (staticVerdict.verdict === "halt") {
    return staticVerdict;
  }

  const flags: DestinationFlag[] = [...staticVerdict.flags];
  const pubkey = new PublicKey(address.trim());

  let info: Awaited<
    ReturnType<typeof agent.connection.getParsedAccountInfo>
  >["value"];
  try {
    const resp = await agent.connection.getParsedAccountInfo(pubkey);
    info = resp.value;
  } catch (error: any) {
    flags.push({
      code: "RPC_LOOKUP_FAILED",
      severity: "warn",
      message: `could not verify destination on-chain (${error?.message ?? error}); proceeding only after manual confirmation`,
    });
    return verdictFromFlags(flags, pubkey.toBase58());
  }

  if (info === null) {
    // Non-existent account. Legal for a first SOL transfer (it gets created),
    // but a frequent symptom of a typo'd address, so warn rather than halt.
    flags.push({
      code: "DESTINATION_NOT_FOUND",
      severity: "warn",
      message:
        "destination account does not exist yet / holds 0 lamports; valid for a first SOL transfer but a common symptom of a mistyped address — double-check it",
    });
    return verdictFromFlags(flags, pubkey.toBase58());
  }

  const owner = info.owner.toBase58();
  const isTokenOwned =
    owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ||
    owner === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

  // Detect a mint account via the parsed data shape.
  const parsed =
    info.data && "parsed" in info.data ? (info.data.parsed as any) : null;
  const isMint = parsed?.type === "mint";

  if (isMint) {
    flags.push({
      code: "DESTINATION_IS_MINT",
      severity: "halt",
      message:
        "destination is an SPL token MINT account; sending SOL or tokens to a mint is a classic, unrecoverable loss",
    });
  } else if (isTokenOwned && isNativeSol) {
    flags.push({
      code: "NATIVE_SOL_TO_TOKEN_ACCOUNT",
      severity: "warn",
      message:
        "destination is owned by the Token program (a token account), but you are sending native SOL; confirm you do not mean the owning wallet instead",
    });
  }

  return verdictFromFlags(flags, pubkey.toBase58());
}
