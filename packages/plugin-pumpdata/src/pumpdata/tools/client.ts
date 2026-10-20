import { decodePaymentResponseHeader } from "@x402/fetch";
import type { SolanaAgentKit } from "solana-agent-kit";
import {
  PUMPDATA_BASE_URL,
  PUMPDATA_PRICES_USD,
  type PumpDataPaidCall,
  type PumpDataPaymentReceipt,
  type PumpDataResponse,
} from "../types";
import { createPumpDataPaymentFetch } from "./x402";

export class PumpDataApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    options: { status: number; code?: string; details?: unknown },
  ) {
    super(message);
    this.name = "PumpDataApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

/**
 * Calls one of pumpdata.fun's free endpoints. Never pays: a 402 here is an error.
 */
export async function pumpDataFreeGet<T = Record<string, any>>(
  path: string,
): Promise<PumpDataResponse<T>> {
  const response = await globalThis.fetch(`${PUMPDATA_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  return readPumpDataResponse<T>(response, 0);
}

/**
 * Calls one of pumpdata.fun's paid endpoints. The first request goes out
 * unpaid; the 402 it gets back is paid over x402 in USDC with the agent's own
 * wallet, capped at the call's listed price, and the request is retried once.
 */
export async function pumpDataPaidRequest<T = Record<string, any>>(
  agent: SolanaAgentKit,
  call: PumpDataPaidCall,
  path: string,
  init: RequestInit = {},
): Promise<PumpDataResponse<T>> {
  const priceUsd = PUMPDATA_PRICES_USD[call];
  const paidFetch = createPumpDataPaymentFetch(agent, priceUsd);

  let response: Response;
  try {
    response = await paidFetch(`${PUMPDATA_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch (error: any) {
    throw new Error(
      `pumpdata.fun ${call} call could not be paid: ${error?.message ?? error}`,
    );
  }

  return readPumpDataResponse<T>(response, priceUsd);
}

async function readPumpDataResponse<T>(
  response: Response,
  priceUsd: number,
): Promise<PumpDataResponse<T>> {
  const text = await response.text();
  const body = parseJson(text);

  if (!response.ok) {
    throw toPumpDataError(response.status, body ?? text);
  }

  return {
    data: body as T,
    dataFrom: response.headers.get("x-data-from") ?? undefined,
    dataAsOf: response.headers.get("x-data-as-of") ?? undefined,
    payment: readReceipt(response),
    priceUsd,
  };
}

function readReceipt(response: Response): PumpDataPaymentReceipt | undefined {
  const header =
    response.headers.get("payment-response") ??
    response.headers.get("x-payment-response");
  if (!header) {
    return undefined;
  }
  try {
    const receipt = decodePaymentResponseHeader(header);
    return {
      success: receipt.success,
      transaction: receipt.transaction,
      network: receipt.network,
      payer: receipt.payer,
    };
  } catch {
    return undefined;
  }
}

function toPumpDataError(status: number, body: unknown): PumpDataApiError {
  const fields =
    body && typeof body === "object" ? (body as Record<string, any>) : {};
  const code: string | undefined =
    typeof fields.error === "string" ? fields.error : undefined;
  const detail: string | undefined =
    typeof fields.detail === "string"
      ? fields.detail
      : typeof fields.reason === "string"
        ? fields.reason
        : undefined;
  const said = [code, detail].filter(Boolean).join(": ");

  let hint = "";
  if (status === 402) {
    hint =
      " The payment was not accepted and nothing settled; read the reason before paying again.";
  } else if (status === 404) {
    hint =
      " Nothing was charged: the window ends before the data begins, or the mint is not built yet.";
  } else if (status === 400) {
    hint = " Nothing was charged: the request is malformed.";
  } else if (status === 429) {
    hint = " Too many calls; wait for retry-after (60 s).";
  } else if (code === "payment_settle_uncertain") {
    hint =
      " The payment may or may not have settled; do not pay again without checking.";
  }

  return new PumpDataApiError(
    `pumpdata.fun answered ${status}${said ? ` (${said})` : ""}.${hint}`,
    { status, code, details: body },
  );
}

function parseJson(text: string): unknown {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Flattens an answer into the fields an action returns: the body, its own
 * one-paragraph `summary` when it has one, the data's dates and the payment.
 */
export function pumpDataResultFields(response: PumpDataResponse) {
  const summary =
    typeof response.data?.summary === "string"
      ? response.data.summary
      : undefined;
  return {
    data: response.data,
    summary,
    dataAsOf: response.dataAsOf,
    dataFrom: response.dataFrom,
    paidUsd: response.payment?.success ? response.priceUsd : 0,
    paymentTransaction: response.payment?.transaction,
  };
}
