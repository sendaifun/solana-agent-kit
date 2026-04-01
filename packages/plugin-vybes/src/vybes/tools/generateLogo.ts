const VYBES_API_URL = "https://vybes.fun";

export type VybesLogoStyle =
  | "meme" | "cute" | "cool" | "hype" | "moon"
  | "pixel" | "anime" | "3d" | "logo" | "degen";

export interface GenerateLogoParams {
  name: string;
  symbol: string;
  style?: VybesLogoStyle;
}

export interface GenerateLogoResult {
  success: boolean;
  imageUrl: string;
  name: string;
  symbol: string;
  style: string;
}

/**
 * Generate an AI logo for a token via vybes.fun Workers AI (FLUX model).
 * Free, no payment required. Rate limited to 20/hour.
 * Returns a public URL to a 1024x1024 PNG.
 *
 * @param params - Token name, symbol, and optional style
 */
export async function generateVybesLogo(
  params: GenerateLogoParams,
): Promise<GenerateLogoResult> {
  const style = params.style || "meme";

  const res = await fetch(`${VYBES_API_URL}/api/agent/logo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: params.name,
      symbol: params.symbol,
      style,
    }),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Logo generation failed");
  }

  return {
    success: true,
    imageUrl: data.data.imageUrl,
    name: params.name,
    symbol: params.symbol,
    style,
  };
}
