import { TokenCheck } from "solana-agent-kit";

const BASE_URL = "https://api.rugcheck.xyz/v1";

/**
 * Resilient HTTP client with timeout, exponential backoff, and rate-limiting handling
 */
async function fetchWithResilience(
  url: string,
  retries = 2,
  timeoutMs = 5000,
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          // Rate-limited: perform exponential backoff and retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (attempt === retries) {
        throw new Error(
          err.name === "AbortError" ? "Network request timed out" : err.message,
        );
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}

/**
 * Zero-crash defensive parser to align raw responses with strict TokenCheck typing
 */
function parseTokenCheck(report: any): TokenCheck {
  const score = typeof report.score === "number" ? report.score : 0;
  const tokenProgram =
    typeof report.tokenProgram === "string" ? report.tokenProgram : "Unknown";
  const tokenType =
    typeof report.tokenType === "string" ? report.tokenType : "Unknown";
  const rawRisks = Array.isArray(report.risks) ? report.risks : [];

  const risks = rawRisks.map((r: any) => ({
    name: typeof r.name === "string" ? r.name : "Unknown Risk",
    level: typeof r.level === "string" ? r.level : "warning",
    description:
      typeof r.description === "string"
        ? r.description
        : "No description provided.",
    score: typeof r.score === "number" ? r.score : 0,
  }));

  return {
    tokenProgram,
    tokenType,
    risks,
    score,
  };
}

/**
 * Fetches a summary report for a specific token with full network resilience.
 */
export async function fetchTokenReportSummary(
  mint: string,
): Promise<TokenCheck> {
  try {
    const data = await fetchWithResilience(
      `${BASE_URL}/tokens/${mint}/report/summary`,
    );
    return parseTokenCheck(data);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch report summary for token ${mint}: ${error.message}`,
    );
  }
}

/**
 * Fetches a detailed report for a specific token with full network resilience.
 */
export async function fetchTokenDetailedReport(
  mint: string,
): Promise<TokenCheck> {
  try {
    const data = await fetchWithResilience(`${BASE_URL}/tokens/${mint}/report`);
    return parseTokenCheck(data);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch detailed report for token ${mint}: ${error.message}`,
    );
  }
}
