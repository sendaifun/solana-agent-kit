// Builds the ColdstarWallet the agent will hold.
//
// The agent gets a SESSION key bounded by a policy. The root key is not in
// this process, this repo, or this machine's environment: on Coldstar it lives
// as an encrypted keyfile on an air-gapped device and signs the policy, not
// transactions. Here, for a devnet demo, the session key is a throwaway
// Keypair persisted to .session.json so airdrops survive across runs.

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import qrcode from "qrcode-terminal";
import {
  ColdstarWallet,
  FileSpendLedger,
  type EscalationHandler,
  type Policy,
  type Verdict,
} from "@coldstar/agent-signer";

export const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";
if (/mainnet/i.test(RPC_URL)) {
  throw new Error("This example is devnet-only. Refusing to run against a mainnet RPC.");
}

function sessionKeypair(): Keypair {
  if (process.env.COLDSTAR_SESSION_KEY) {
    return Keypair.fromSecretKey(bs58.decode(process.env.COLDSTAR_SESSION_KEY));
  }
  if (existsSync(".session.json")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(".session.json", "utf8"))));
  }
  const kp = Keypair.generate();
  writeFileSync(".session.json", JSON.stringify(Array.from(kp.secretKey)));
  console.log(`generated a devnet session key -> .session.json (${kp.publicKey.toBase58()})`);
  return kp;
}

export const session = sessionKeypair();

// Demo recipients. The root signs a policy naming SPECIFIC addresses, so they
// must be stable across runs: from .env if set, otherwise generated once and
// kept in .demo-recipients.json (gitignored).
function demoRecipients(): { allowed: string; blocked: string } {
  if (process.env.ALLOWED_RECIPIENT && process.env.BLOCKED_RECIPIENT) {
    return { allowed: process.env.ALLOWED_RECIPIENT, blocked: process.env.BLOCKED_RECIPIENT };
  }
  if (existsSync(".demo-recipients.json")) {
    return JSON.parse(readFileSync(".demo-recipients.json", "utf8"));
  }
  const r = { allowed: Keypair.generate().publicKey.toBase58(), blocked: Keypair.generate().publicKey.toBase58() };
  writeFileSync(".demo-recipients.json", JSON.stringify(r, null, 2) + "\n");
  return r;
}
const recipients = demoRecipients();
export const ALLOWED_RECIPIENT = new PublicKey(recipients.allowed);
export const BLOCKED_RECIPIENT = new PublicKey(recipients.blocked);

/** coldstar.policy.json with $ENV placeholders filled in. */
export function loadPolicy(): Policy {
  const raw = readFileSync(new URL("../coldstar.policy.json", import.meta.url), "utf8")
    .replaceAll("$ALLOWED_RECIPIENT", ALLOWED_RECIPIENT.toBase58())
    .replaceAll("$BLOCKED_RECIPIENT", BLOCKED_RECIPIENT.toBase58());
  return JSON.parse(raw) as Policy;
}

/**
 * The air-gap hand-off, simulated. In production this is where the unsigned
 * transaction crosses to the offline Coldstar device by QR for a human to
 * approve. Here we print the QR and decline, so the caller sees the
 * ColdstarEscalation carrying the same payload.
 */
export const printQrAndDecline: EscalationHandler = async (tx, reason) => {
  const bytes =
    "version" in tx
      ? tx.serialize()
      : tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  console.log(`\n  ESCALATE: ${reason}`);
  console.log("  Unsigned transaction for the air-gapped device (scan with Coldstar):\n");
  qrcode.generate(Buffer.from(bytes).toString("base64"), { small: true }, (q) =>
    console.log(q.split("\n").map((l) => "  " + l).join("\n")),
  );
  return null; // nobody approved it in this demo
};

export function logDecision(v: Verdict): void {
  const amt = v.intent ? `${v.intent.outSol} SOL` : "unparsed";
  console.log(`  [policy] ${v.decision.padEnd(9)} ${amt.padEnd(12)} ${v.reason}`);
}

export function makeWallet(): ColdstarWallet {
  const common = {
    session,
    rpcUrl: RPC_URL,
    onEscalate: printQrAndDecline,
    onDecision: logDecision,
    // The daily cap survives restarts: a crashing-and-relaunching agent does not get a fresh 0.
    ledger: new FileSpendLedger(".coldstar-ledger.json"),
    // Off-chain message signing stays off: SIWS / order signatures can authorise
    // things the transaction policy never sees.
    allowMessageSigning: false,
  };

  // Preferred: a policy the ROOT signed (see src/cold.ts / `npm run sign-policy`).
  // The wallet refuses to start if the envelope was edited, names another session
  // key, expired, or was signed by a root other than the one we pin.
  if (existsSync("envelope.json")) {
    const envelope = JSON.parse(readFileSync("envelope.json", "utf8")) as { rootPubkey: string };
    const expectedRoot = process.env.COLDSTAR_ROOT_PUBKEY ?? envelope.rootPubkey; // pin from env in anything real
    const w = ColdstarWallet.fromEnvelope({ ...common, envelope, expectedRoot });
    console.log(`policy: root-signed envelope from ${w.envelope?.rootPubkey}${w.envelope?.expiresAt ? `, valid until ${w.envelope.expiresAt}` : ""}`);
    return w;
  }

  // Fallback for a first run: the bare, unsigned policy. Fine on devnet; say so.
  console.log("policy: UNSIGNED coldstar.policy.json (run `npm run sign-policy` to have the root sign it)");
  return new ColdstarWallet({ ...common, policy: loadPolicy() });
}
