import {
  Keypair,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";
import type { CrewpayLaunchOptions, CrewpayUnsignedPlan } from "../types";
import { crewpayFetch, getCrewpayApiKey } from "./client";

function hasSignature(tx: VersionedTransaction, signer: string): boolean {
  const idx = tx.message.staticAccountKeys.findIndex(
    (k) => k.toBase58() === signer,
  );
  const sig = idx >= 0 ? tx.signatures[idx] : undefined;
  return !!sig && sig.some((b) => b !== 0);
}

function toTransaction(step: CrewpayUnsignedPlan["steps"][number]) {
  if (step.transactionBase64) {
    return VersionedTransaction.deserialize(
      Buffer.from(step.transactionBase64, "base64"),
    );
  }
  return new VersionedTransaction(
    VersionedMessage.deserialize(Buffer.from(step.messageBase64, "base64")),
  );
}

/**
 * Build UNSIGNED CrewPay launch transactions for the agent's wallet.
 * The mint keypair is generated locally and never leaves this process.
 * @param agent - SolanaAgentKit instance (its wallet becomes the on-chain creator / launching agent)
 * @param options - Launch options
 * @returns the unsigned plan and the local mint keypair
 */
export async function buildCrewpayUnsignedLaunch(
  agent: SolanaAgentKit,
  options: CrewpayLaunchOptions,
): Promise<{ plan: CrewpayUnsignedPlan; mintKeypair: Keypair }> {
  const apiKey = getCrewpayApiKey(agent);
  const mintKeypair = Keypair.generate();
  const body: Record<string, unknown> = {
    name: options.name,
    ticker: options.ticker,
    description: options.description ?? "",
    imageUrl: options.imageUrl,
    platform: options.platform ?? "pumpfun",
    initialBuySol: options.initialBuySol ?? 0,
    launcherPubkey: agent.wallet.publicKey.toBase58(),
    mintPubkey: mintKeypair.publicKey.toBase58(),
  };
  if (options.crew?.length) {
    body.crew = options.crew;
  } else {
    body.autoHire = { seats: options.autoHireSeats ?? 5 };
  }
  if (options.twitter) {
    body.twitter = options.twitter;
  }
  if (options.website) {
    body.website = options.website;
  }

  const plan = await crewpayFetch<CrewpayUnsignedPlan>(
    "/api/agent/launch/unsigned",
    { method: "POST", apiKey, body },
  );
  return { plan, mintKeypair };
}

/**
 * Launch a coin on Pump.fun or Bags.fm through CrewPay: build unsigned transactions,
 * sign them locally with the agent wallet (non-custodial), then submit.
 * The fee-share config pays 60% of creator fees to the hired KOL crew,
 * 15% to the launching agent (this wallet) and 25% to the CrewPay treasury
 * (60/15/5/20 when the API key was claimed with a referral code).
 * @param agent - SolanaAgentKit instance
 * @param options - Launch options
 */
export async function launchCrewpayToken(
  agent: SolanaAgentKit,
  options: CrewpayLaunchOptions,
): Promise<any> {
  const apiKey = getCrewpayApiKey(agent);
  const { plan, mintKeypair } = await buildCrewpayUnsignedLaunch(
    agent,
    options,
  );
  if (!plan.steps?.length) {
    throw new Error("CrewPay returned no transactions to sign");
  }

  const walletKey = agent.wallet.publicKey.toBase58();
  const mintKey = mintKeypair.publicKey.toBase58();
  const txs = plan.steps.map((step) => {
    const tx = toTransaction(step);
    // Anything we do not hold must already be signed (e.g. a partially signed Bags tx).
    const unknown = step.requiredSigners.filter(
      (s) => s !== walletKey && s !== mintKey && !hasSignature(tx, s),
    );
    if (unknown.length) {
      throw new Error(
        `Step ${step.kind} needs signers this agent does not hold: ${unknown.join(", ")}`,
      );
    }
    if (step.requiredSigners.includes(mintKey)) {
      tx.sign([mintKeypair]);
    }
    return tx;
  });

  const signed = await agent.wallet.signAllTransactions(txs);
  const signedBase64 = signed.map((tx) =>
    Buffer.from(tx.serialize()).toString("base64"),
  );

  if (agent.config.signOnly) {
    return {
      mint: plan.mint,
      signedTransactions: signedBase64,
      submitTo: "POST https://api.crewpay.dev/api/agent/launch/submit",
    };
  }

  return crewpayFetch("/api/agent/launch/submit", {
    method: "POST",
    apiKey,
    body: { signed: signedBase64, platform: options.platform ?? "pumpfun" },
  });
}
