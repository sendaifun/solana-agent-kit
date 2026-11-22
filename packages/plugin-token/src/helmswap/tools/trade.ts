import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { type SolanaAgentKit } from "solana-agent-kit";
import { HelmswapApi, helmswapApiKey } from "./api";
import {
  DEFAULT_HELMSWAP_SLIPPAGE_BPS,
  HELMSWAP_KEY_DOCS,
  HELMSWAP_SOL_MINT,
} from "./constants";
import { fetchHelmswapQuote, toHelmswapBaseUnits } from "./quote";

/**
 * Swap tokens using HelmSwap.
 * HelmSwap returns an unsigned transaction; this signs and sends it with the
 * agent's wallet. The API never signs or broadcasts. A disclosed fee is
 * included in the quote and as a transfer instruction in the same transaction.
 *
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap in whole tokens (e.g. 0.01 SOL)
 * @param inputMint Source token mint (defaults to native SOL)
 * @param slippageBps Slippage tolerance in basis points (default: 50 = 0.5%)
 */
export async function tradeWithHelmswap(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = HELMSWAP_SOL_MINT,
  slippageBps: number = DEFAULT_HELMSWAP_SLIPPAGE_BPS,
): Promise<{
  transaction: string | VersionedTransaction;
  inputAmount: number;
  inputMint: string;
  outputMint: string;
  expectedOut?: string;
  minOut?: string;
  fee?: unknown;
}> {
  const apiKey = helmswapApiKey(agent);
  if (!apiKey) {
    throw new Error(
      `Building Solana swaps needs a free HelmSwap API key. Create one at ${HELMSWAP_KEY_DOCS} and set HELMSWAP_API_KEY in the agent config or environment.`,
    );
  }

  const quote = await fetchHelmswapQuote(
    agent,
    outputMint,
    inputAmount,
    inputMint,
    slippageBps,
  );

  if (quote.priceImpact?.buildable === false) {
    const reason =
      quote.priceImpact.warning ||
      `HelmSwap refused to build this swap (price impact ${quote.priceImpact.priceImpactPct ?? "unknown"}).`;
    throw new Error(reason);
  }

  const api = new HelmswapApi(undefined, apiKey);
  const amount = await toHelmswapBaseUnits(agent, inputMint, inputAmount);
  const built = await api.buildTx({
    chain: "solana",
    inputMint: inputMint.toBase58(),
    outputMint: outputMint.toBase58(),
    amount,
    user: agent.wallet.publicKey.toBase58(),
    quoteTicket: quote.quoteTicket,
    slippageBps,
  });

  const transactionBase64: string | undefined = built.tx?.transactionBase64;
  if (!transactionBase64) {
    throw new Error("HelmSwap did not return a Solana transaction");
  }

  // Sign the transaction exactly as built so its instructions (including the
  // disclosed fee transfer) stay intact. The wallet is called directly so the
  // transaction is not rebuilt with a new blockhash or compute-budget ix.
  const transaction = VersionedTransaction.deserialize(
    Buffer.from(transactionBase64, "base64"),
  );

  let signature: string | VersionedTransaction;
  if (agent.config?.signOnly) {
    signature = await agent.wallet.signTransaction(transaction);
  } else if (!agent.wallet.signAndSendTransaction) {
    throw new Error(
      "Wallet does not support signAndSendTransaction please implement it manually or use the signOnly option",
    );
  } else {
    signature = (await agent.wallet.signAndSendTransaction(transaction))
      .signature;
  }

  return {
    transaction: signature,
    inputAmount,
    inputMint: inputMint.toBase58(),
    outputMint: outputMint.toBase58(),
    expectedOut: quote.quote?.netOutAmount,
    minOut: quote.quote?.minNetOutAmount,
    fee: quote.quote?.fee,
  };
}
