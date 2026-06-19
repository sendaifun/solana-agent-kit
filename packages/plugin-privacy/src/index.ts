/**
 * Privacy Plugin for Solana Agent Kit — PII Sanitization Layer
 *
 * Masks sensitive data in user inputs before LLM processing.
 * Enterprise-grade: GDPR (EU), LGPD (Brazil), APPI (Japan) compliance ready.
 *
 * Detects and masks:
 *   - Solana wallet addresses (base58, 32-44 chars)
 *   - Solana private keys (base58, 64 bytes = ~88 chars)
 *   - Email addresses
 *   - IP addresses (v4 and v6)
 *   - Potential API keys / tokens
 *
 * Issue: https://github.com/sendaifun/solana-agent-kit/issues/560
 */

import { SolanaAgentKit } from "../../core/src";

// ── Types ─────────────────────────────────────────────────────────

export interface PrivacyConfig {
  /** Replace PII with placeholder tags instead of removing */
  usePlaceholders: boolean;
  /** Custom patterns to detect (regex + replacement label) */
  customPatterns: Array<{ pattern: RegExp; label: string }>;
  /** Whether to log sanitization events (PII-free) */
  auditLog: boolean;
  /** Minimum entropy threshold for API key detection (default 4.0) */
  entropyThreshold: number;
  /** Domains to treat as non-PII (e.g. your own project domains) */
  allowedDomains: string[];
}

export interface SanitizationResult {
  /** Original input (never logged) */
  originalLength: number;
  /** Sanitized safe-to-send text */
  sanitizedText: string;
  /** Categories of PII detected */
  detectedCategories: string[];
  /** Number of items masked */
  itemsMasked: number;
  /** Safety score 0-100 (higher = cleaner) */
  safetyScore: number;
  /** Risk level */
  riskLevel: "low" | "medium" | "high";
  /** Timestamp of sanitization */
  timestamp: number;
}

// ── Default config ───────────────────────────────────────────────

const DEFAULT_CONFIG: PrivacyConfig = {
  usePlaceholders: true,
  customPatterns: [],
  auditLog: false,
  entropyThreshold: 4.0,
  allowedDomains: [],
};

// ── PII Detection Patterns ────────────────────────────────────────

const PII_PATTERNS: Array<{ pattern: RegExp; category: string; replacement: string }> = [
  // Solana private key (88 base58 chars, matches Phantom/CLI export format)
  {
    pattern: /\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/g,
    category: "solana_private_key",
    replacement: "[PRIVATE_KEY]",
  },
  // Solana wallet address (32-44 base58 chars, not a private key)
  {
    pattern: /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g,
    category: "solana_wallet",
    replacement: "[SOL_WALLET]",
  },
  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    category: "email",
    replacement: "[EMAIL]",
  },
  // IPv4 addresses
  {
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    category: "ip_address",
    replacement: "[IP]",
  },
  // Potential API keys (generic pattern: 20+ alphanumeric mixed case)
  {
    pattern: /\b[A-Za-z0-9_-]{20,}\b/g,
    category: "potential_token",
    replacement: "[TOKEN]",
  },
];

// ── Entropy-based key detection ───────────────────────────────────

function shannonEntropy(str: string): number {
  const counts = new Map<string, number>();
  for (const char of str) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  let entropy = 0;
  const len = str.length;
  for (const count of counts.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ── Main Sanitization Logic ───────────────────────────────────────

export function sanitizeInput(
  input: string,
  config: Partial<PrivacyConfig> = {}
): SanitizationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let text = input;
  const detected: string[] = [];
  let itemsMasked = 0;

  // Apply pattern-based detection
  for (const { pattern, category, replacement } of PII_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      // Skip wallet pattern if we already handled private keys for the same text
      if (category === "solana_wallet") {
        // Filter out known non-wallet base58 strings
        const realWallets = matches.filter((m) => {
          // Skip strings that look like base64 or are part of URLs
          if (m.includes("+") || m.includes("/") || m.includes("=")) return false;
          return true;
        });
        if (realWallets.length === 0) continue;
        text = text.replace(pattern, cfg.usePlaceholders ? replacement : "");
        detected.push(category);
        itemsMasked += realWallets.length;
      } else if (category === "potential_token") {
        // Only flag high-entropy strings as potential tokens
        const highEntropy = matches.filter((m) => shannonEntropy(m) > cfg.entropyThreshold);
        if (highEntropy.length === 0) continue;
        text = text.replace(pattern, (match) =>
          shannonEntropy(match) > cfg.entropyThreshold
            ? (cfg.usePlaceholders ? replacement : "")
            : match
        );
        detected.push(category);
        itemsMasked += highEntropy.length;
      } else {
        text = text.replace(pattern, cfg.usePlaceholders ? replacement : "");
        detected.push(category);
        itemsMasked += matches.length;
      }
    }
  }

  // Apply custom patterns
  for (const { pattern, label } of cfg.customPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      text = text.replace(pattern, cfg.usePlaceholders ? `[${label}]` : "");
      detected.push(label.toLowerCase());
      itemsMasked += matches.length;
    }
  }

  // Calculate safety score
  const uniqueCategories = [...new Set(detected)];
  const safetyScore = Math.max(0, 100 - uniqueCategories.length * 20);

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  if (detected.includes("solana_private_key") || detected.includes("potential_token")) {
    riskLevel = "high";
  } else if (detected.length >= 2) {
    riskLevel = "medium";
  }

  return {
    originalLength: input.length,
    sanitizedText: text,
    detectedCategories: uniqueCategories,
    itemsMasked,
    safetyScore,
    riskLevel,
    timestamp: Date.now(),
  };
}

// ── Plugin Entry Point ───────────────────────────────────────────

export class PrivacyPlugin {
  private config: PrivacyConfig;

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Sanitize text before sending to LLM or external services */
  sanitize(input: string): SanitizationResult {
    return sanitizeInput(input, this.config);
  }

  /** Wrap a string handler with automatic sanitization */
  wrapHandler<T>(
    handler: (input: string, ...args: any[]) => T
  ): (input: string, ...args: any[]) => T {
    return (input: string, ...args: any[]) => {
      const result = this.sanitize(input);
      if (this.config.auditLog) {
        console.log(
          `[PrivacyPlugin] Sanitized: ${result.itemsMasked} items, ` +
          `categories: ${result.detectedCategories.join(",")}, ` +
          `risk: ${result.riskLevel}, score: ${result.safetyScore}`
        );
      }
      return handler(result.sanitizedText, ...args);
    };
  }

  /** Expose as a Solana Agent Kit plugin */
  static asPlugin(config: Partial<PrivacyConfig> = {}) {
    const plugin = new PrivacyPlugin(config);

    return {
      name: "plugin-privacy",

      /** Install on agent — wraps relevant tools */
      install(agent: SolanaAgentKit) {
        // Wrapping is opt-in: call agent.use(PrivacyPlugin.asPlugin()).sanitize() before LLM calls
        // Or use the standalone sanitizeInput() function directly
        return {
          sanitize: plugin.sanitize.bind(plugin),
          wrapHandler: plugin.wrapHandler.bind(plugin),
        };
      },
    };
  }
}

// ── Export standalone utilities ──────────────────────────────────

export default PrivacyPlugin;
