import {
  type Address,
  type SignatureBytes,
  type SignatureDictionary,
  type Transaction,
  type TransactionPartialSigner,
  address,
} from "@solana/kit";
import { VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import type { SolanaAgentKit } from "solana-agent-kit";
import { SOLANA_MAINNET_CAIP2 } from "../types";

/**
 * Adapts the agent's wallet (any `BaseWallet`) to the `TransactionPartialSigner`
 * that the x402 Solana client signs payments with.
 *
 * The x402 `exact` scheme builds a USDC `transferChecked` whose fee payer is the
 * facilitator named in the 402 offer. The agent's wallet only adds its
 * signature as the transfer's authority; the facilitator co-signs and lands it.
 * Nothing here sends a transaction.
 */
export function createAgentPaymentSigner(
  agent: SolanaAgentKit,
): TransactionPartialSigner {
  const publicKey = agent.wallet.publicKey;
  const signerAddress: Address = address(publicKey.toBase58());

  return {
    address: signerAddress,
    async signTransactions(
      transactions: readonly Transaction[],
    ): Promise<readonly SignatureDictionary[]> {
      const signatures: SignatureDictionary[] = [];

      for (const transaction of transactions) {
        const messageBytes = Uint8Array.from(transaction.messageBytes);
        const signed = await agent.wallet.signTransaction(
          new VersionedTransaction(VersionedMessage.deserialize(messageBytes)),
        );

        if (!bytesEqual(signed.message.serialize(), messageBytes)) {
          throw new Error(
            "The wallet changed the payment transaction while signing it",
          );
        }

        const index = signed.message.staticAccountKeys.findIndex((key) =>
          key.equals(publicKey),
        );
        if (index < 0 || index >= signed.message.header.numRequiredSignatures) {
          throw new Error(
            "The payment transaction does not ask the agent's wallet to sign",
          );
        }

        const signature = signed.signatures[index];
        if (!signature || signature.every((byte) => byte === 0)) {
          throw new Error("The agent's wallet did not sign the payment");
        }

        signatures.push(
          Object.freeze({ [signerAddress]: signature as SignatureBytes }),
        );
      }

      return signatures;
    },
  };
}

/**
 * Returns a `fetch` that answers an x402 402 by paying with the agent's wallet
 * in USDC on Solana mainnet, then retries the request with PAYMENT-SIGNATURE.
 *
 * @param agent - The agent whose wallet pays
 * @param maxPriceUsd - The most this one call may cost; a 402 asking for more
 * is refused before anything is signed
 */
export function createPumpDataPaymentFetch(
  agent: SolanaAgentKit,
  maxPriceUsd: number,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  const scheme = new ExactSvmScheme(createAgentPaymentSigner(agent), {
    rpcUrl: agent.connection.rpcEndpoint,
  });

  const client = x402Client.fromConfig({
    schemes: [{ network: SOLANA_MAINNET_CAIP2, client: scheme }],
    spendControls: { maxAmountPerPayment: `$${maxPriceUsd}` },
  });

  return wrapFetchWithPayment(
    (input, init) => globalThis.fetch(input, init),
    client,
  );
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
