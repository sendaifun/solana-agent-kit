export function normalizeScaled(scaled: bigint, decimals: number): string {
  const scaledStr = scaled.toString();
  if (scaledStr.length <= decimals) {
    return `0.${scaledStr.padStart(decimals, "0").replace(/0+$/, "")}`.replace(
      /\.$/,
      "",
    );
  }
  const integerPart = scaledStr.slice(0, scaledStr.length - decimals);
  let decimalPart = scaledStr.slice(-decimals);
  // Remove trailing zeros
  decimalPart = decimalPart.replace(/0+$/, "");
  return `${integerPart || "0"}.${decimalPart}`.replace(/\.$/, "");
}
