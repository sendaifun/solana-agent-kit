import { DEFAULT_HELMSWAP_BASE_URL } from "./constants";

export class HelmswapApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HelmswapApiError";
  }
}

export class HelmswapApi {
  constructor(
    private readonly baseUrl: string = DEFAULT_HELMSWAP_BASE_URL,
    private readonly apiKey?: string,
  ) {}

  get hasApiKey() {
    return Boolean(this.apiKey);
  }

  async quote(params: Record<string, string | number | undefined>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        query.set(key, String(value));
      }
    }
    return this.request("GET", `/api/v1/quote?${query.toString()}`);
  }

  async buildTx(body: Record<string, unknown>) {
    return this.request("POST", "/api/v1/build-tx", body);
  }

  private async request(
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>,
  ) {
    const headers: Record<string, string> = { accept: "application/json" };
    if (body) {
      headers["content-type"] = "application/json";
    }
    if (this.apiKey) {
      headers["X-Helm-Key"] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any;
    try {
      json = await response.json();
    } catch {
      throw new HelmswapApiError(
        `HelmSwap returned a non-JSON response (${response.status})`,
        response.status,
      );
    }

    if (!response.ok || json?.ok === false) {
      throw new HelmswapApiError(
        json?.error ?? `HelmSwap request failed (${response.status})`,
        response.status,
        json?.code,
      );
    }

    return json;
  }
}

export function helmswapApiKey(agent: {
  config?: { HELMSWAP_API_KEY?: string };
}): string | undefined {
  return agent.config?.HELMSWAP_API_KEY || process.env.HELMSWAP_API_KEY;
}
