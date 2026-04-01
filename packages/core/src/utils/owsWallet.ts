import { Keypair } from "@solana/web3.js";
import { KeypairWallet } from "./keypairWallet";
import type { BaseWallet } from "../types/wallet";

/**
 * Create a KeypairWallet from an OWS (Open Wallet Standard) encrypted vault.
 *
 * The Solana signing key is decrypted from the OWS vault only during
 * construction, then the Keypair is held in memory. The raw key material
 * in the vault is encrypted with AES-256-GCM + scrypt KDF.
 *
 * @param walletNameOrId - OWS wallet name or UUID
 * @param rpcUrl - Solana RPC endpoint
 * @returns A KeypairWallet backed by the OWS vault key
 *
 * @example
 * ```ts
 * import { owsWallet } from "solana-agent-kit";
 *
 * const wallet = owsWallet("my-agent-wallet", rpcUrl);
 * const agent = new SolanaAgentKit(wallet, rpcUrl, config);
 * ```
 */
export function owsWallet(walletNameOrId: string, rpcUrl: string): BaseWallet {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { signMessage } = require("@open-wallet-standard/core") as {
    signMessage: (
      wallet: string,
      chain: string,
      message: string,
      passphrase?: string,
      encoding?: string,
    ) => { signature: string };
  };
  const { exportWallet } = require("@open-wallet-standard/core") as {
    exportWallet: (nameOrId: string) => string;
  };

  const exported = exportWallet(walletNameOrId);

  let secretKey: Uint8Array;
  try {
    const keys = JSON.parse(exported);
    const hex = keys.ed25519 ?? "";
    secretKey = Uint8Array.from(
      (hex.startsWith("0x") ? hex.slice(2) : hex).match(/.{2}/g)!.map((b: string) => parseInt(b, 16)),
    );
  } catch {
    // Mnemonic — derive Solana key
    const { deriveAddress } = require("@open-wallet-standard/core") as {
      deriveAddress: (mnemonic: string, chain: string) => { address: string };
    };
    // For mnemonic wallets, we need the full keypair — use signMessage to verify
    // then reconstruct from the vault
    throw new Error(
      "OWS mnemonic wallets require exportWallet to return key material. " +
        "Use an imported private key wallet instead.",
    );
  }

  const keypair = Keypair.fromSecretKey(secretKey);
  return new KeypairWallet(keypair, rpcUrl);
}
