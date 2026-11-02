// Amount parsing shared by the MCP tools and the Agent Kit actions. Amounts travel as strings: `amount`
// in base units (an integer, what the chain uses) or `usdg` / `h081` as a decimal token amount.

export function toUnits(s: string, decimals: number): bigint {
  const t = String(s).trim();
  if (!/^\d+(\.\d+)?$/.test(t)) {
    throw new Error(`enter an amount like 12.5 (got "${s}")`);
  }
  const [i, f = ""] = t.split(".");
  if (f.length > decimals) {
    throw new Error(`at most ${decimals} decimals`);
  }
  return (
    BigInt(i) * 10n ** BigInt(decimals) +
    BigInt((f + "0".repeat(decimals)).slice(0, decimals) || "0")
  );
}

/** Plain decimal text (no grouping), trailing zeros trimmed; `max` fraction digits. */
export function fromUnits(x: bigint, decimals: number, max = decimals): string {
  const neg = x < 0n;
  if (neg) {
    x = -x;
  }
  const d = 10n ** BigInt(decimals);
  const i = x / d,
    f = (x % d)
      .toString()
      .padStart(decimals, "0")
      .slice(0, max)
      .replace(/0+$/, "");
  return `${neg ? "-" : ""}${i}${f ? "." + f : ""}`;
}

/**
 * One amount from `{amount}` (base units) or `{<unitKey>}` (decimal tokens); exactly one must be given.
 * `positive` (default) refuses zero.
 */
export function parseAmount(
  args: Record<string, unknown>,
  unitKey: string,
  decimals: number,
  opts: { positive?: boolean; baseKey?: string } = {},
): bigint {
  const baseKey = opts.baseKey ?? "amount";
  const base = args[baseKey],
    human = args[unitKey];
  const has = (v: unknown) =>
    v !== undefined && v !== null && String(v).trim() !== "";
  if (has(base) && has(human)) {
    throw new Error(
      `give either "${baseKey}" (base units) or "${unitKey}" (decimal), not both`,
    );
  }
  let out: bigint;
  if (has(base)) {
    const s = String(base).trim();
    if (!/^\d+$/.test(s)) {
      throw new Error(
        `"${baseKey}" must be an integer in base units (got "${s}"); use "${unitKey}" for a decimal amount`,
      );
    }
    out = BigInt(s);
  } else if (has(human)) {
    out = toUnits(String(human), decimals);
  } else {
    throw new Error(`give "${baseKey}" (base units) or "${unitKey}" (decimal)`);
  }
  if ((opts.positive ?? true) && out <= 0n) {
    throw new Error("the amount must be positive");
  }
  return out;
}
