const TX_CHECK = "https://apexfaucet.xyz/api/x402/tx-check";
const DELIVERY_SCORE = "https://apexfaucet.xyz/api/x402/delivery-score";

export async function apexGet(url: string) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const text = await response.text();
  let body: unknown = text.slice(0, 8000);
  try {
    body = JSON.parse(text);
  } catch {
    // keep the clipped text
  }
  if (response.status === 402) {
    return {
      paid: false,
      http: 402,
      note: "Unpaid. Pay the returned x402 terms with your own wallet, then retry. Nothing was signed here.",
      terms: body,
    };
  }
  return { http: response.status, body };
}

export async function checkUnsignedSolanaTx(signer: string, tx: string) {
  if (!signer || !tx) {
    return { status: "error", message: "signer and tx are required. Do not pass a private key." };
  }
  const params = new URLSearchParams({ chain: "solana", signer, tx });
  const result = await apexGet(`${TX_CHECK}?${params.toString()}`);
  return { status: "success", result };
}

export async function scoreX402Url(url: string) {
  if (!url.startsWith("https://")) {
    return { status: "error", message: "url must start with https://" };
  }
  const params = new URLSearchParams({ url });
  const result = await apexGet(`${DELIVERY_SCORE}?${params.toString()}`);
  return { status: "success", result };
}
