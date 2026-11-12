import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import {
  SODAX_API,
  SodaxIntent,
  SodaxIntentResponse,
  SodaxStatusResponse,
  SodaxSwapInput,
  SodaxSwapResult,
} from "../types";

const ZERO_SOLVER = "0x0000000000000000000000000000000000000000";
const DEFAULT_SLIPPAGE_BPS = 100; // 1%
const DEFAULT_POLL_TIMEOUT_MS = 8 * 60_000;
const POLL_INTERVAL_MS = 4_000;

async function sodaxPost<T>(
  path: string,
  body: unknown,
  apiKey?: string,
): Promise<T> {
  const headers: HeadersInit = { "content-type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  const response = await fetch(`${SODAX_API}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text.slice(0, 200) };
  }
  if (!response.ok) {
    throw new Error(json.message || `SODAX ${path} ${response.status}`);
  }
  return json as T;
}

async function sodaxGet<T>(path: string, apiKey?: string): Promise<T> {
  const headers: HeadersInit = {};
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  const response = await fetch(`${SODAX_API}${path}`, {
    headers,
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text.slice(0, 200) };
  }
  if (!response.ok) {
    throw new Error(json.message || `SODAX ${path} ${response.status}`);
  }
  return json as T;
}

/**
 * Execute a full SODAX cross-chain swap from a Solana source address.
 *
 * Flow: intents (builds unsigned Solana tx) → sign + send via agent wallet
 *       → submit-tx (hands off to SODAX relay) → poll status.
 *
 * The agent wallet must own the source tokens and cover Solana transaction fees.
 *
 * @param agent SolanaAgentKit instance; must NOT be in signOnly mode
 * @param params Swap parameters
 * @param apiKey Optional SODAX API key
 */
export async function sodaxSwap(
  agent: SolanaAgentKit,
  params: SodaxSwapInput,
  apiKey?: string,
): Promise<SodaxSwapResult> {
  if (agent.config.signOnly) {
    throw new Error(
      "sodaxSwap: agent must not be in signOnly mode — the swap requires broadcasting to Solana and relaying to SODAX",
    );
  }

  const slippageBps = params.slippageBps ?? DEFAULT_SLIPPAGE_BPS;
  const pollTimeoutMs = params.pollTimeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;

  // 1. Get a quote to calculate minOutputAmount with slippage
  const quoteBody = {
    tokenSrc: params.inputTokenAddress,
    tokenSrcChainKey: params.srcChainKey,
    tokenDst: params.outputTokenAddress,
    tokenDstChainKey: params.dstChainKey,
    amount: params.inputAmount,
    quoteType: "exact_input",
  };
  const quote = await sodaxPost<{ quotedAmount: string }>(
    "/quote",
    quoteBody,
    apiKey,
  );
  const quotedOut = BigInt(quote.quotedAmount);
  const minOutputAmount = (
    (quotedOut * BigInt(10_000 - slippageBps)) /
    10_000n
  ).toString();

  // 2. Fetch a fresh deadline from SODAX (~5 minutes from hub time)
  const deadlineData = await sodaxGet<{ deadline: number }>(
    "/deadline?offsetSeconds=300",
    apiKey,
  );
  const deadline = String(deadlineData.deadline);

  // 3. Build the create-intent tx
  const intentBody = {
    srcChainKey: params.srcChainKey,
    dstChainKey: params.dstChainKey,
    inputToken: params.inputTokenAddress,
    outputToken: params.outputTokenAddress,
    inputAmount: params.inputAmount,
    minOutputAmount,
    deadline,
    allowPartialFill: false,
    srcAddress: params.srcAddress,
    dstAddress: params.dstAddress,
    solver: ZERO_SOLVER,
    data: "0x",
  };
  const intentResp = await sodaxPost<SodaxIntentResponse>(
    "/intents",
    intentBody,
    apiKey,
  );

  if (!intentResp.tx?.data) {
    throw new Error("SODAX /intents did not return a transaction");
  }

  // 4. Deserialise and sign + send the Solana transaction
  const txBytes = Buffer.from(intentResp.tx.data, "base64");
  const transaction = VersionedTransaction.deserialize(txBytes);

  // Refresh blockhash so the tx doesn't expire
  const { blockhash } = await agent.connection.getLatestBlockhash("confirmed");
  transaction.message.recentBlockhash = blockhash;

  const signResult = await signOrSendTX(agent, transaction);
  if (typeof signResult !== "string") {
    throw new Error(
      "signOrSendTX did not return a transaction signature — ensure the agent is not in signOnly mode",
    );
  }
  const txHash = signResult;

  // 5. Hand off to SODAX relay
  await sodaxPost(
    "/submit-tx",
    {
      txHash,
      srcChainKey: params.srcChainKey,
      walletAddress: params.srcAddress,
      intent: intentResp.intent as SodaxIntent,
      relayData: intentResp.relayData.payload,
    } satisfies {
      txHash: string;
      srcChainKey: string;
      walletAddress: string;
      intent: SodaxIntent;
      relayData: string;
    },
    apiKey,
  );

  // 6. Poll until solved, failed, or timeout
  const deadline2 = Date.now() + pollTimeoutMs;
  while (Date.now() < deadline2) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const status = await sodaxGet<SodaxStatusResponse>(
      `/submit-tx/status?txHash=${encodeURIComponent(txHash)}&srcChainKey=${encodeURIComponent(params.srcChainKey)}`,
      apiKey,
    );
    const d = status.data ?? {};
    if (d.status === "solved") {
      return {
        status: "solved",
        txHash,
        dstIntentTxHash: d.result?.dstIntentTxHash,
        fillTxHash: d.result?.fillTxHash,
      };
    }
    if (d.status === "failed") {
      return {
        status: "failed",
        txHash,
        userMessage: d.userMessage ?? d.failureReason ?? "Swap failed",
      };
    }
  }

  return { status: "timeout", txHash };
}

/**
 * Build an unsigned SODAX create-intent transaction for a Solana source address
 * without signing or submitting. Useful for inspecting the tx shape or
 * delegating signing to an external wallet.
 */
export async function buildSodaxIntent(
  params: SodaxSwapInput,
  apiKey?: string,
): Promise<{
  tx: VersionedTransaction;
  intent: SodaxIntent;
  relayData: string;
}> {
  const quoteBody = {
    tokenSrc: params.inputTokenAddress,
    tokenSrcChainKey: params.srcChainKey,
    tokenDst: params.outputTokenAddress,
    tokenDstChainKey: params.dstChainKey,
    amount: params.inputAmount,
    quoteType: "exact_input",
  };
  const quote = await sodaxPost<{ quotedAmount: string }>(
    "/quote",
    quoteBody,
    apiKey,
  );
  const slippageBps = params.slippageBps ?? DEFAULT_SLIPPAGE_BPS;
  const quotedOut = BigInt(quote.quotedAmount);
  const minOutputAmount = (
    (quotedOut * BigInt(10_000 - slippageBps)) /
    10_000n
  ).toString();

  const deadlineData = await sodaxGet<{ deadline: number }>(
    "/deadline?offsetSeconds=300",
    apiKey,
  );

  const intentBody = {
    srcChainKey: params.srcChainKey,
    dstChainKey: params.dstChainKey,
    inputToken: params.inputTokenAddress,
    outputToken: params.outputTokenAddress,
    inputAmount: params.inputAmount,
    minOutputAmount,
    deadline: String(deadlineData.deadline),
    allowPartialFill: false,
    srcAddress: params.srcAddress,
    dstAddress: params.dstAddress,
    solver: ZERO_SOLVER,
    data: "0x",
  };
  const resp = await sodaxPost<SodaxIntentResponse>(
    "/intents",
    intentBody,
    apiKey,
  );

  const txBytes = Buffer.from(resp.tx.data, "base64");
  const tx = VersionedTransaction.deserialize(txBytes);

  return {
    tx,
    intent: resp.intent as SodaxIntent,
    relayData: resp.relayData.payload,
  };
}
