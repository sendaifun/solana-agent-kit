import type { JupiterTokenData, JupiterTokenV2 } from "../../types";

/**
 * Map a Jupiter Token API v2 record onto the JupiterTokenData shape the
 * plugin's public API still exposes.
 */
export function toJupiterTokenData(token: JupiterTokenV2): JupiterTokenData {
  return {
    address: token.id,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    tags: token.tags ?? [],
    logoURI: token.icon ?? "",
    daily_volume:
      (token.stats24h?.buyVolume ?? 0) + (token.stats24h?.sellVolume ?? 0),
    // v2 only reports whether an authority is disabled, never its address, so
    // these stay null. Read the mint account directly if you need the addresses;
    // `audit` carries the disabled flags if you only need to know they are gone.
    freeze_authority: null,
    mint_authority: null,
    permanent_delegate: null,
    extensions: {},
  };
}
