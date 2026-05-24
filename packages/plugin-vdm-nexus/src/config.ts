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
   * payment payloads. Must correspond to the same pubkey as the
   * SolanaAgentKit wallet, otherwise NEXUS_CHAT returns a
   * `wallet_signer_mismatch` error. Required for NEXUS_CHAT; optional
   * for NEXUS_VERIFY_RECEIPT and NEXUS_GET_DEPOSIT_ADDRESS.
   */
  signerSecretKey?: string;
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
}

export function resolveConfig(config?: VdmNexusPluginConfig): ResolvedConfig {
  return {
    endpoint: (config?.endpoint ?? DEFAULT_ENDPOINT).replace(/\/$/, ""),
    operatorKey: config?.operatorKey,
    signerSecretKey: config?.signerSecretKey ?? "",
  };
}
