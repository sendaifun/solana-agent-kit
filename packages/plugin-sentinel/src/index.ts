/**
 * @solana-agent-kit/plugin-sentinel
 *
 * AI Safety Validation Plugin for Solana Agent Kit
 *
 * Implements the THSP (Truth-Harm-Scope-Purpose) protocol for
 * validating AI agent transactions on Solana before execution.
 */

import type { Action, Plugin, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum THSPGate {
  TRUTH = "truth",
  HARM = "harm",
  SCOPE = "scope",
  PURPOSE = "purpose",
}

export interface GateResult {
  gate: THSPGate;
  passed: boolean;
  reason?: string;
}

export interface SafetyValidationResult {
  safe: boolean;
  riskLevel: RiskLevel;
  shouldProceed: boolean;
  requiresConfirmation: boolean;
  gateResults: GateResult[];
  concerns: string[];
  recommendations: string[];
  metadata: {
    action: string;
    timestamp: number;
    validationDurationMs: number;
  };
}

export interface SentinelConfig {
  maxTransactionAmount?: number;
  confirmationThreshold?: number;
  blockedAddresses?: string[];
  allowedPrograms?: string[];
  requirePurposeFor?: string[];
  strictMode?: boolean;
}

export interface ValidationInput {
  action: string;
  amount?: number;
  recipient?: string;
  programId?: string;
  memo?: string;
  purpose?: string;
  tokenMint?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<Omit<SentinelConfig, "blockedAddresses" | "allowedPrograms">> &
  Pick<SentinelConfig, "blockedAddresses" | "allowedPrograms"> = {
  maxTransactionAmount: 100,
  confirmationThreshold: 10,
  blockedAddresses: [],
  allowedPrograms: [],
  requirePurposeFor: ["transfer", "swap", "approve", "bridge", "withdraw", "stake"],
  strictMode: false,
};

const HIGH_RISK_ACTIONS = [
  "drain",
  "sweep",
  "transferAll",
  "sendAll",
  "approveUnlimited",
  "infiniteApproval",
];

const SUSPICIOUS_PATTERNS = [
  { pattern: /drain|sweep|empty/i, risk: RiskLevel.CRITICAL, msg: "Potential drain operation" },
  { pattern: /unlimited|infinite|max.*approv/i, risk: RiskLevel.HIGH, msg: "Unlimited approval request" },
  { pattern: /all|entire|whole.*transfer|send/i, risk: RiskLevel.HIGH, msg: "Bulk transfer operation" },
  { pattern: /private.*key|secret.*key|seed.*phrase|mnemonic/i, risk: RiskLevel.CRITICAL, msg: "Private key exposure risk" },
];

// ============================================================================
// Validator Class
// ============================================================================

class SentinelValidator {
  private config: typeof DEFAULT_CONFIG;
  private history: SafetyValidationResult[] = [];

  constructor(config: SentinelConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  validate(input: ValidationInput): SafetyValidationResult {
    const startTime = Date.now();
    const gateResults: GateResult[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];
    let riskLevel = RiskLevel.LOW;

    // GATE 1: TRUTH
    const truthResult = this.checkTruthGate(input);
    gateResults.push(truthResult);
    if (!truthResult.passed) concerns.push(truthResult.reason || "Truth gate failed");

    // GATE 2: HARM
    const harmResult = this.checkHarmGate(input);
    gateResults.push(harmResult);
    if (!harmResult.passed) {
      concerns.push(harmResult.reason || "Harm gate failed");
      riskLevel = this.escalateRisk(riskLevel, RiskLevel.HIGH);
    }

    // GATE 3: SCOPE
    const scopeResult = this.checkScopeGate(input);
    gateResults.push(scopeResult);
    if (!scopeResult.passed) {
      concerns.push(scopeResult.reason || "Scope gate failed");
      riskLevel = this.escalateRisk(riskLevel, RiskLevel.MEDIUM);
    }

    // GATE 4: PURPOSE
    const purposeResult = this.checkPurposeGate(input);
    gateResults.push(purposeResult);
    if (!purposeResult.passed) {
      concerns.push(purposeResult.reason || "Purpose gate failed");
      riskLevel = this.escalateRisk(riskLevel, RiskLevel.MEDIUM);
    }

    // Check suspicious patterns
    const patternCheck = this.checkPatterns(input);
    concerns.push(...patternCheck.concerns);
    riskLevel = this.escalateRisk(riskLevel, patternCheck.risk);

    // Generate recommendations
    if ((input.amount || 0) > this.config.confirmationThreshold) {
      recommendations.push("High-value transaction - manual confirmation recommended");
    }
    if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL) {
      recommendations.push("Review transaction details carefully before proceeding");
    }
    if (concerns.some(c => c.includes("purpose"))) {
      recommendations.push(`Provide explicit purpose for ${input.action} using the 'purpose' parameter`);
    }

    const allGatesPassed = gateResults.every(g => g.passed);
    const safe = allGatesPassed && concerns.length === 0;
    const shouldProceed = this.config.strictMode
      ? safe
      : riskLevel !== RiskLevel.CRITICAL && allGatesPassed;

    const result: SafetyValidationResult = {
      safe,
      riskLevel,
      shouldProceed,
      requiresConfirmation: (input.amount || 0) > this.config.confirmationThreshold || riskLevel === RiskLevel.HIGH,
      gateResults,
      concerns,
      recommendations,
      metadata: {
        action: input.action,
        timestamp: Date.now(),
        validationDurationMs: Date.now() - startTime,
      },
    };

    this.history.push(result);
    return result;
  }

  private checkTruthGate(input: ValidationInput): GateResult {
    if (input.recipient && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.recipient)) {
      return { gate: THSPGate.TRUTH, passed: false, reason: "Invalid recipient address format" };
    }
    if (input.programId && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.programId)) {
      return { gate: THSPGate.TRUTH, passed: false, reason: "Invalid program ID format" };
    }
    if (input.amount !== undefined && (isNaN(input.amount) || input.amount < 0)) {
      return { gate: THSPGate.TRUTH, passed: false, reason: "Invalid transaction amount" };
    }
    return { gate: THSPGate.TRUTH, passed: true };
  }

  private checkHarmGate(input: ValidationInput): GateResult {
    if (input.recipient && this.config.blockedAddresses?.includes(input.recipient)) {
      return { gate: THSPGate.HARM, passed: false, reason: `Recipient is a blocked address` };
    }
    const actionLower = input.action.toLowerCase();
    if (HIGH_RISK_ACTIONS.some(p => actionLower.includes(p.toLowerCase()))) {
      return { gate: THSPGate.HARM, passed: false, reason: `High-risk action detected: ${input.action}` };
    }
    if (this.config.allowedPrograms?.length && input.programId && !this.config.allowedPrograms.includes(input.programId)) {
      return { gate: THSPGate.HARM, passed: false, reason: "Program not in whitelist" };
    }
    return { gate: THSPGate.HARM, passed: true };
  }

  private checkScopeGate(input: ValidationInput): GateResult {
    if (input.amount !== undefined && input.amount > this.config.maxTransactionAmount) {
      return { gate: THSPGate.SCOPE, passed: false, reason: `Amount ${input.amount} exceeds maximum ${this.config.maxTransactionAmount}` };
    }
    return { gate: THSPGate.SCOPE, passed: true };
  }

  private checkPurposeGate(input: ValidationInput): GateResult {
    const actionLower = input.action.toLowerCase();
    const requiresPurpose = this.config.requirePurposeFor.some(k => actionLower.includes(k.toLowerCase()));
    if (requiresPurpose && !input.purpose) {
      return { gate: THSPGate.PURPOSE, passed: false, reason: `Action '${input.action}' requires explicit purpose` };
    }
    if (input.purpose && input.purpose.trim().length < 10) {
      return { gate: THSPGate.PURPOSE, passed: false, reason: "Purpose explanation is too brief" };
    }
    return { gate: THSPGate.PURPOSE, passed: true };
  }

  private checkPatterns(input: ValidationInput): { concerns: string[]; risk: RiskLevel } {
    const concerns: string[] = [];
    let maxRisk = RiskLevel.LOW;
    const text = [input.action, input.memo, input.purpose].filter(Boolean).join(" ");

    for (const { pattern, risk, msg } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(text)) {
        concerns.push(msg);
        maxRisk = this.escalateRisk(maxRisk, risk);
      }
    }
    return { concerns, risk: maxRisk };
  }

  private escalateRisk(current: RiskLevel, incoming: RiskLevel): RiskLevel {
    const levels = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL];
    return levels[Math.max(levels.indexOf(current), levels.indexOf(incoming))];
  }

  getStats() {
    if (this.history.length === 0) {
      return { totalValidations: 0, blocked: 0, approved: 0, highRisk: 0, blockRate: 0 };
    }
    const blocked = this.history.filter(r => !r.shouldProceed).length;
    const highRisk = this.history.filter(r => r.riskLevel === RiskLevel.HIGH || r.riskLevel === RiskLevel.CRITICAL).length;
    return {
      totalValidations: this.history.length,
      blocked,
      approved: this.history.length - blocked,
      highRisk,
      blockRate: blocked / this.history.length,
    };
  }

  clearHistory() { this.history = []; }

  blockAddress(address: string) {
    if (!this.config.blockedAddresses) this.config.blockedAddresses = [];
    if (!this.config.blockedAddresses.includes(address)) {
      this.config.blockedAddresses.push(address);
    }
  }

  unblockAddress(address: string) {
    if (this.config.blockedAddresses) {
      this.config.blockedAddresses = this.config.blockedAddresses.filter(a => a !== address);
    }
  }

  updateConfig(updates: Partial<SentinelConfig>) {
    this.config = { ...this.config, ...updates };
  }
}

// ============================================================================
// Tool Functions
// ============================================================================

let globalValidator: SentinelValidator | null = null;

function getValidator(): SentinelValidator {
  if (!globalValidator) globalValidator = new SentinelValidator();
  return globalValidator;
}

export async function validateTransaction(
  _agent: SolanaAgentKit,
  input: ValidationInput
): Promise<SafetyValidationResult> {
  return getValidator().validate(input);
}

export async function checkSafety(
  _agent: SolanaAgentKit,
  action: string,
  amount?: number,
  recipient?: string
): Promise<{ safe: boolean; riskLevel: RiskLevel; concerns: string[] }> {
  const result = getValidator().validate({ action, amount, recipient });
  return { safe: result.safe, riskLevel: result.riskLevel, concerns: result.concerns };
}

export async function getSafetyStats(_agent: SolanaAgentKit): Promise<{
  stats: ReturnType<SentinelValidator["getStats"]>;
  config: SentinelConfig;
}> {
  const validator = getValidator();
  return { stats: validator.getStats(), config: {} };
}

export async function blockAddress(_agent: SolanaAgentKit, address: string): Promise<{ success: boolean; message: string }> {
  getValidator().blockAddress(address);
  return { success: true, message: `Address ${address.slice(0, 8)}... added to blocklist` };
}

export async function unblockAddress(_agent: SolanaAgentKit, address: string): Promise<{ success: boolean; message: string }> {
  getValidator().unblockAddress(address);
  return { success: true, message: `Address ${address.slice(0, 8)}... removed from blocklist` };
}

export async function clearValidationHistory(_agent: SolanaAgentKit): Promise<{ success: boolean }> {
  getValidator().clearHistory();
  return { success: true };
}

export async function updateSafetyConfig(_agent: SolanaAgentKit, config: SentinelConfig): Promise<{ success: boolean }> {
  getValidator().updateConfig(config);
  return { success: true };
}

// ============================================================================
// Actions
// ============================================================================

const validateTransactionAction: Action = {
  name: "SENTINEL_VALIDATE_TRANSACTION",
  similes: ["check transaction safety", "validate transfer", "safety check", "verify transaction", "sentinel validate", "thsp check"],
  description: "Validate a Solana transaction for safety using the Sentinel THSP protocol. Checks Truth (data accuracy), Harm (potential damage), Scope (limits), and Purpose (legitimate benefit) gates.",
  examples: [
    [{
      input: { action: "transfer", amount: 10, recipient: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" },
      output: { status: "success", safe: true, shouldProceed: true, riskLevel: "low" },
      explanation: "Validating a 10 SOL transfer to a valid recipient",
    }],
    [{
      input: { action: "transfer", amount: 500, recipient: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" },
      output: { status: "blocked", safe: false, shouldProceed: false, riskLevel: "medium" },
      explanation: "Transaction blocked because amount exceeds limit",
    }],
  ],
  schema: z.object({
    action: z.string().describe("Transaction action type (transfer, swap, stake)"),
    amount: z.number().positive().optional().describe("Transaction amount"),
    recipient: z.string().optional().describe("Recipient wallet address"),
    programId: z.string().optional().describe("Program ID being called"),
    memo: z.string().optional().describe("Transaction memo"),
    purpose: z.string().optional().describe("Purpose/justification for the transaction"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, unknown>) => {
    const result = await validateTransaction(agent, input as ValidationInput);
    const status = result.safe && result.shouldProceed ? "success" : !result.shouldProceed ? "blocked" : "warning";
    return { status, ...result };
  },
};

const checkSafetyAction: Action = {
  name: "SENTINEL_CHECK_SAFETY",
  similes: ["is safe", "quick safety check", "safety status"],
  description: "Quick pass/fail safety check for a transaction without full THSP gate analysis.",
  examples: [
    [{
      input: { action: "transfer", amount: 5 },
      output: { safe: true, riskLevel: "low", concerns: [] },
      explanation: "Quick check for a small transfer",
    }],
  ],
  schema: z.object({
    action: z.string().describe("Transaction action type"),
    amount: z.number().optional().describe("Transaction amount"),
    recipient: z.string().optional().describe("Recipient address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, unknown>) => {
    return checkSafety(agent, input.action as string, input.amount as number, input.recipient as string);
  },
};

const getSafetyStatsAction: Action = {
  name: "SENTINEL_GET_SAFETY_STATS",
  similes: ["safety statistics", "validation stats", "block rate"],
  description: "Get validation statistics including total validations, blocked transactions, and block rate.",
  examples: [
    [{
      input: {},
      output: { stats: { totalValidations: 100, blocked: 5, approved: 95, blockRate: 0.05 } },
      explanation: "Get current safety statistics",
    }],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => getSafetyStats(agent),
};

const blockAddressAction: Action = {
  name: "SENTINEL_BLOCK_ADDRESS",
  similes: ["blacklist address", "block wallet", "add to blocklist"],
  description: "Add an address to the blocklist to prevent transactions.",
  examples: [
    [{
      input: { address: "ScamAddress123..." },
      output: { success: true, message: "Address ScamAddr... added to blocklist" },
      explanation: "Block a known scam address",
    }],
  ],
  schema: z.object({
    address: z.string().describe("Wallet address to block"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, unknown>) => {
    return blockAddress(agent, input.address as string);
  },
};

const unblockAddressAction: Action = {
  name: "SENTINEL_UNBLOCK_ADDRESS",
  similes: ["unblacklist address", "unblock wallet", "remove from blocklist"],
  description: "Remove an address from the blocklist.",
  examples: [
    [{
      input: { address: "VerifiedAddress123..." },
      output: { success: true, message: "Address Verified... removed from blocklist" },
      explanation: "Unblock a verified address",
    }],
  ],
  schema: z.object({
    address: z.string().describe("Wallet address to unblock"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, unknown>) => {
    return unblockAddress(agent, input.address as string);
  },
};

// ============================================================================
// Plugin Export
// ============================================================================

const SentinelPlugin = {
  name: "sentinel",

  methods: {
    validateTransaction,
    checkSafety,
    getSafetyStats,
    blockAddress,
    unblockAddress,
    clearValidationHistory,
    updateSafetyConfig,
  },

  actions: [
    validateTransactionAction,
    checkSafetyAction,
    getSafetyStatsAction,
    blockAddressAction,
    unblockAddressAction,
  ],

  initialize: function (agent: SolanaAgentKit): void {
    // Initialize global validator
    globalValidator = new SentinelValidator();

    // Bind methods to agent context
    for (const [name, method] of Object.entries(this.methods)) {
      if (typeof method === "function") {
        (this.methods as Record<string, unknown>)[name] = method.bind(this);
      }
    }
  },
} satisfies Plugin;

export default SentinelPlugin;

// Re-export types and utilities
export { SentinelValidator, SentinelPlugin };
export type { ValidationInput, SafetyValidationResult, SentinelConfig, GateResult };
