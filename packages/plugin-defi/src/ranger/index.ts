// Exports will be added once actions and tools are implemented

function getEnvOrDefault(envKey: string, fallback: string): string {
  const proc =
    typeof globalThis !== "undefined" && (globalThis as any).process
      ? (globalThis as any).process
      : undefined;
  if (proc && proc.env && proc.env[envKey]) {
    return proc.env[envKey];
  }
  return fallback;
}

export const RANGER_SOR_API_BASE = getEnvOrDefault(
  "RANGER_SOR_API_BASE",
  "https://staging-sor-api-437363704888.asia-northeast1.run.app"
);
export const RANGER_DATA_API_BASE = getEnvOrDefault(
  "RANGER_DATA_API_BASE",
  "https://data-api-staging-437363704888.asia-northeast1.run.app"
);

export * from "./actions";
export * from "./tools";
