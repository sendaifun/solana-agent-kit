import {
  type Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

export const SWAPCHAN_API = "https://api.swapchan.com";
/** SwapChan's chain id for Solana. */
export const SWAPCHAN_SOLANA_CHAIN_ID = 792703809;
/** SwapChan's native SOL token id. */
const NATIVE_SOL = "11111111111111111111111111111111";
const WSOL = "So11111111111111111111111111111111111111112";

export interface SwapChanQuoteInput {
  /** Mint to sell (SOL: So111...112 or 111...111). */
  inputMint: string;
  /** Token to buy: Solana mint, or an EVM/BTC/Tron token address when toChainId is set. */
  outputMint: string;
  /** Human-readable amount of inputMint, e.g. 0.5 */
  amount: number;
  slippageBps?: number;
  /** Destination chain id for cross-chain swaps (1 Ethereum, 8453 Base, 42161 Arbitrum, 56 BNB, 8253038 Bitcoin, 728126428 Tron, ...). Default: Solana. */
  toChainId?: number;
  /** Recipient on the destination chain; required when toChainId is not Solana. */
  toAddress?: string;
}

interface Quote {
  id: string;
  provider: string;
  toAmount: string;
  toAmountMin: string;
  gasUsd: number;
  feeUsd: number;
  netUsd: number | null;
  etaSeconds: number;
  expiresAt: number;
}

interface SvmIx {
  programId: string;
  keys: { pubkey: string; isSigner: boolean; isWritable: boolean }[];
  data: string;
}

const partnerOf = (agent: SolanaAgentKit) =>
  (agent.config as Record<string, unknown> | undefined)?.SWAPCHAN_PARTNER_ID as
    | string
    | undefined;

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${SWAPCHAN_API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      accept: "application/json",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      `SwapChan ${path.split("?")[0]} failed (${res.status}): ${json?.error ?? "unknown error"}`,
    );
  return json as T;
}

const normMint = (m: string) => (m === WSOL ? NATIVE_SOL : m);

async function decimalsOf(chainId: number, token: string): Promise<number> {
  if (chainId === SWAPCHAN_SOLANA_CHAIN_ID && token === NATIVE_SOL) return 9;
  const t = await api<{ decimals: number }>(
    `/token?chainId=${chainId}&address=${token}`,
  );
  return t.decimals;
}

function toBaseUnits(amount: number, decimals: number): string {
  const [w, f = ""] = amount.toFixed(decimals).split(".");
  return BigInt(w + f.padEnd(decimals, "0")).toString();
}

function fromBaseUnits(amount: string, decimals: number): number {
  return Number(amount) / 10 ** decimals;
}

/**
 * Best-price quote from Solana to Solana or to another chain via SwapChan, which compares
 * Jupiter, LI.FI, Relay, deBridge, THORChain and more and ranks routes by net output.
 */
export async function swapchanGetQuote(
  agent: SolanaAgentKit,
  input: SwapChanQuoteInput,
) {
  const toChainId = input.toChainId ?? SWAPCHAN_SOLANA_CHAIN_ID;
  const fromToken = normMint(input.inputMint);
  const toToken =
    toChainId === SWAPCHAN_SOLANA_CHAIN_ID
      ? normMint(input.outputMint)
      : input.outputMint;
  const [inDec, outDec] = await Promise.all([
    decimalsOf(SWAPCHAN_SOLANA_CHAIN_ID, fromToken),
    decimalsOf(toChainId, toToken),
  ]);
  const owner = agent.wallet.publicKey.toBase58();
  const q = new URLSearchParams({
    fromChainId: String(SWAPCHAN_SOLANA_CHAIN_ID),
    toChainId: String(toChainId),
    fromToken,
    toToken,
    amount: toBaseUnits(input.amount, inDec),
    slippageBps: String(input.slippageBps ?? 50),
    fromAddress: owner,
    toAddress:
      input.toAddress ??
      (toChainId === SWAPCHAN_SOLANA_CHAIN_ID ? owner : ""),
  });
  const partner = partnerOf(agent);
  if (partner) q.set("partner", partner);
  for (const [k, v] of [...q.entries()]) if (!v) q.delete(k);
  const r = await api<{
    quotes: Quote[];
    best: string | null;
    errors: { provider: string; message: string }[];
  }>(`/quotes?${q}`);
  if (!r.quotes.length)
    throw new Error(
      `SwapChan found no route${r.errors.length ? `: ${r.errors.map((e) => `${e.provider}: ${e.message}`).join("; ")}` : ""}`,
    );
  return {
    best: r.best,
    quotes: r.quotes.slice(0, 5).map((x) => ({
      id: x.id,
      provider: x.provider,
      outAmount: fromBaseUnits(x.toAmount, outDec),
      minOutAmount: fromBaseUnits(x.toAmountMin, outDec),
      gasUsd: x.gasUsd,
      feeUsd: x.feeUsd,
      etaSeconds: x.etaSeconds,
      expiresAt: new Date(x.expiresAt).toISOString(),
    })),
  };
}

/** Turn a SwapChan Solana payload into an unsigned VersionedTransaction. */
export async function swapchanPayloadToTx(
  payload: { kind: string; data: unknown },
  payer: PublicKey,
  connection: Connection,
): Promise<VersionedTransaction> {
  if (payload.kind === "svm-base64")
    return VersionedTransaction.deserialize(
      Buffer.from(String(payload.data), "base64"),
    );
  if (payload.kind !== "svm-instructions")
    throw new Error(`Unsupported SwapChan payload: ${payload.kind}`);
  const d = payload.data as {
    instructions: SvmIx[];
    addressLookupTableAddresses?: string[];
  };
  const instructions = d.instructions.map(
    (ix) =>
      new TransactionInstruction({
        programId: new PublicKey(ix.programId),
        keys: ix.keys.map((k) => ({ ...k, pubkey: new PublicKey(k.pubkey) })),
        data: Buffer.from(ix.data.replace(/^0x/, ""), "hex"),
      }),
  );
  const luts = await Promise.all(
    (d.addressLookupTableAddresses ?? []).map(async (a) => {
      const r = await connection.getAddressLookupTable(new PublicKey(a));
      if (!r.value) throw new Error(`Lookup table ${a} not found`);
      return r.value;
    }),
  );
  const { blockhash } = await connection.getLatestBlockhash();
  return new VersionedTransaction(
    new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(luts),
  );
}

/** Build the unsigned Solana transaction for the best SwapChan route (or a given quote id). */
export async function swapchanBuildSwap(
  agent: SolanaAgentKit,
  input: SwapChanQuoteInput & { quoteId?: string },
) {
  const quote = input.quoteId
    ? { id: input.quoteId }
    : await swapchanGetQuote(agent, input).then((r) => ({
        id: r.best ?? r.quotes[0].id,
        ...r.quotes[0],
      }));
  const built = await api<{
    execution?: string;
    nonEvmTx?: { vm: string; kind: string; data: unknown };
  }>("/build", {
    quoteId: quote.id,
    taker: agent.wallet.publicKey.toBase58(),
    ...(input.toAddress ? { recipient: input.toAddress } : {}),
  });
  if (!built.nonEvmTx || built.nonEvmTx.vm !== "svm")
    throw new Error("SwapChan did not return a Solana transaction for this route");
  const tx = await swapchanPayloadToTx(
    built.nonEvmTx,
    agent.wallet.publicKey,
    agent.connection,
  );
  return { quote, tx };
}

/** Swap (or bridge out of Solana) at the best SwapChan price. Signs and sends with the agent's wallet. */
export async function swapchanSwap(
  agent: SolanaAgentKit,
  input: SwapChanQuoteInput & { quoteId?: string },
) {
  const { quote, tx } = await swapchanBuildSwap(agent, input);
  const signature = await signOrSendTX(agent, tx);
  return { quote, signature };
}
