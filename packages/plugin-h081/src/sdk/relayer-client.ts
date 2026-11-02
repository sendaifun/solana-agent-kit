// Client of the relayer service (relayer/README.md). A wallet hands an operation to a relayer instead of
// sending it itself: EVM calldata for the pool, or a Solana staged payload. Pass `via: client` in the relay
// options of Wallet.pay / withdraw (EVM) or SolanaWallet.pay / withdraw; without `via` nothing changes.
// Amounts travel as decimal strings.

export interface RelayerInfo {
  evm?: {
    chainId: string;
    pool: string;
    relayer: string;
    minFees: Record<string, string>;
    allowUnpaid: boolean;
  };
  solana?: {
    programId: string;
    relayer: string;
    minFees: Record<string, string>;
    feeAccounts: Record<string, string>;
    lookupTables: string[];
    allowUnpaid: boolean;
  };
}

export interface SolanaRelayBody {
  op: "transact" | "spend" | "grant" | "delegate";
  payload: string;
  mint?: string;
  recipientOwner?: string;
  lenderToken?: string;
  /** capacity operator (base58) and its ed25519 signature (base64) over capacityMessage(payload) (src/solana/relay.ts) */
  operator?: string;
  operatorSig?: string;
}

/** A refusal or failure reported by the relayer: HTTP status, a stable code and a message. */
export class RelayerError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(`relayer ${status} ${code}: ${message}`);
  }
}

export class RelayerClient {
  private cached?: Promise<RelayerInfo>;

  constructor(
    readonly url: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async call<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.fetchImpl(
      new URL(path, this.url.endsWith("/") ? this.url : this.url + "/"),
      {
        method: body === undefined ? "GET" : "POST",
        headers:
          body === undefined ? {} : { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new RelayerError(res.status, "bad_response", text.slice(0, 200));
    }
    if (!res.ok) {
      const err =
        (json as { error?: { code?: string; message?: string } }).error ?? {};
      throw new RelayerError(
        res.status,
        err.code ?? "error",
        err.message ?? text.slice(0, 200),
      );
    }
    return json as T;
  }

  /** What the relayer accepts (cached after the first call). */
  info(refresh = false): Promise<RelayerInfo> {
    if (refresh || !this.cached) {
      this.cached = this.call<RelayerInfo>("v1/info").catch((e) => {
        this.cached = undefined;
        throw e;
      });
    }
    return this.cached;
  }

  /** Submits pool calldata; resolves with the transaction hash once the relayer has sent it. */
  relayEvm(tx: { to: string; data: string }): Promise<{ hash: string }> {
    return this.call("v1/evm/relay", tx);
  }

  /** Submits a staged Solana payload; resolves with the confirmed signature of the operation. */
  relaySolana(
    body: SolanaRelayBody,
  ): Promise<{ signature: string; computeUnits: number }> {
    return this.call("v1/solana/relay", body);
  }

  /** The relayer's EVM address and minimum fee for `asset` (an ERC-20 address), ready to pass as Relay. */
  async evmTerms(asset: string): Promise<{ relayer: string; fee: bigint }> {
    const evm = (await this.info()).evm;
    if (!evm) {
      throw new RelayerError(
        503,
        "chain_disabled",
        "this relayer does not relay EVM operations",
      );
    }
    const fee = evm.minFees[asset.toLowerCase()];
    if (fee === undefined) {
      throw new RelayerError(
        402,
        "asset_not_accepted",
        `fees in ${asset} are not accepted`,
      );
    }
    return { relayer: evm.relayer, fee: BigInt(fee) };
  }

  /** The relayer's Solana pubkey, fee account and minimum fee for `mint` (base58). */
  async solanaTerms(
    mint: string,
  ): Promise<{ relayer: string; feeRecipient: string; fee: bigint }> {
    const sol = (await this.info()).solana;
    if (!sol) {
      throw new RelayerError(
        503,
        "chain_disabled",
        "this relayer does not relay Solana operations",
      );
    }
    const fee = sol.minFees[mint];
    const feeRecipient = sol.feeAccounts[mint];
    if (fee === undefined || !feeRecipient) {
      throw new RelayerError(
        402,
        "asset_not_accepted",
        `fees in ${mint} are not accepted`,
      );
    }
    return { relayer: sol.relayer, feeRecipient, fee: BigInt(fee) };
  }
}
