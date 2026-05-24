/**
 * Plugin configuration — shared by every action and the methods surface.
 *
 * `endpoint` defaults to the public production rail; override for a
 * self-hosted deployment. `operatorKey` is recommended for production
 * audit pipelines so a compromised endpoint cannot serve a forged
 * operator key. `signerSecretKey` is REQUIRED for `NEXUS_CHAT` because
 * the SendAI `BaseWallet` interface does not expose raw secret-key
 * bytes (by design — hardware/browser wallets plug in via the same
 * interface). The verifier and deposit-address actions do not need a
 * secret and work without it.
 */

export const DEFAULT_ENDPOINT = "https://nexus.vdmnexus.com/api/v1";

export interface VdmNexusPluginConfig {
  /**
   * Base URL of the Nexus deployment, including the version prefix.
   *
   * @default "https://nexus.vdmnexus.com/api/v1"
   */
  endpoint?: string;

  /**
   * Optional base58 Ed25519 operator public key to pin for offline
   * receipt verification. When omitted, the verifier fetches it from
   * `${endpoint}/operator-key` on first use.
   */
  operatorKey?: string;

  /**
   * Base58-encoded 64-byte tweetnacl secretKey used to sign x402
   * payment payloads on Solana (`solana:*` networks). Must correspond
   * to the same pubkey as the SolanaAgentKit wallet, otherwise
   * NEXUS_CHAT returns a `wallet_signer_mismatch` error. Required
   * when calling NEXUS_CHAT with a Solana network (or no network
   * override, since the server defaults to Solana). Optional for
   * NEXUS_VERIFY_RECEIPT and NEXUS_GET_DEPOSIT_ADDRESS.
   */
  signerSecretKey?: string;

  /**
   * Optional 0x-prefixed hex secp256k1 private key used to sign x402
   * payment payloads on Base / other EVM networks (`eip155:*`). When
   * NEXUS_CHAT is called with `network: "eip155:8453"` or
   * `network: "eip155:84532"`, this key signs the ERC-3009
   * `transferWithAuthorization` against USDC.
   *
   * The EVM payer is **different** from the SolanaAgentKit wallet —
   * the on-chain payment lands from this EVM address, not from the
   * SendAI agent's Solana pubkey. Receipts for EVM-network calls
   * carry the EVM address as `agent_pubkey` / `payment.payer`. This
   * is intentional and matches how x402 works on EVM chains; the
   * `wallet_signer_mismatch` guard is **not** applied for EVM calls.
   */
  evmPrivateKey?: string;
}

export interface ResolvedConfig {
  endpoint: string;
  operatorKey?: string;
  /**
   * Empty string when not configured — `NEXUS_CHAT` reports a clear
   * error in that case so the agent learns what's missing. Other
   * actions ignore this field.
   */
  signerSecretKey: string;
  /**
   * Empty string when not configured. `NEXUS_CHAT` reports a clear
   * error when an `eip155:*` network is requested without this key.
   */
  evmPrivateKey: string;
}

export function resolveConfig(config?: VdmNexusPluginConfig): ResolvedConfig {
  return {
    endpoint: (config?.endpoint ?? DEFAULT_ENDPOINT).replace(/\/$/, ""),
    operatorKey: config?.operatorKey,
    signerSecretKey: config?.signerSecretKey ?? "",
    evmPrivateKey: config?.evmPrivateKey ?? "",
  };
}
