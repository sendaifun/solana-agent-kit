// More than DELEGATE_OUTPUTS subs per delegation, by chaining delegate calls
// on the residual. Each step is an ordinary delegate proof: up to four subs
// split off the current note, the rest kept as its residual, which the next
// step delegates from. The delegate circuit makes every step's outputs no
// looser than that step's parent, and a residual is the parent's own line
// (same owner, window length, allow-list, expiry, per-tx cap, stream start,
// pledge and spent-so-far), so by induction every sub of the chain is no
// looser than the original allowance, and the window caps and stream rates
// of all subs plus the final residual sum to no more than the original's.
// No circuit change. Pure functions: no I/O, no proving.
import type { Allowance, LenderRef, SpendingKey } from "./crypto.js";
import { DELEGATE_OUTPUTS, type SubGrant, delegateInput } from "./inputs.js";
import type { MerklePath } from "./merkle.js";

export interface DelegationStep {
  /** at most DELEGATE_OUTPUTS subs */
  subs: SubGrant[];
  /** set on the last step only: what the delegator keeps at the end; earlier residuals keep everything not yet shared out */
  residualWindowCap?: bigint;
  residualStreamRate?: bigint;
}

export interface DelegationPlan {
  steps: DelegationStep[];
  /** the residual after every step, as the dry run computed it (the last one is what the delegator keeps) */
  residuals: Allowance[];
}

/**
 * Splits `subs` into delegate steps of at most four, and dry-runs the whole chain (every step's input
 * builder, so every check the SDK makes before proving) against `parent` at `now`, so an impossible plan is
 * refused before the first transaction. A sub's omitted windowCap, maxPerTx, expiry and streamRate default
 * to the ORIGINAL parent's values (as in a single delegation), not to the shrinking intermediate residual's;
 * an omitted streamStart defaults to the time of the step that creates it.
 *
 * Only full steps come first, so placeholder slots (one unit of window cap and stream rate each, when the
 * parent has them) appear in the last step only, as in a single delegation.
 */
export function planDelegation(
  parent: Allowance,
  subs: SubGrant[],
  opts: {
    residualWindowCap?: bigint;
    residualStreamRate?: bigint;
    now: bigint;
    lender?: LenderRef;
    agent: SpendingKey;
    path: MerklePath;
  },
): DelegationPlan {
  if (subs.length === 0) {
    throw new Error("at least one sub");
  }
  const P = parent.policy;
  const resolved: SubGrant[] = subs.map((s) => ({
    ...s,
    windowCap: s.windowCap ?? P.windowCap,
    maxPerTx: s.maxPerTx ?? P.maxPerTx,
    expiry: s.expiry ?? P.expiry,
    streamRate: s.streamRate ?? P.streamRate,
  }));
  const steps: DelegationStep[] = [];
  for (let i = 0; i < resolved.length; i += DELEGATE_OUTPUTS) {
    steps.push({ subs: resolved.slice(i, i + DELEGATE_OUTPUTS) });
  }
  const last = steps[steps.length - 1];
  last.residualWindowCap = opts.residualWindowCap;
  last.residualStreamRate = opts.residualStreamRate;

  const residuals: Allowance[] = [];
  let current = parent;
  for (const step of steps) {
    const built = delegateInput({
      root: 0n,
      allowance: current,
      path: opts.path,
      agent: opts.agent,
      now: opts.now,
      lender: opts.lender,
      extDataHash: 0n,
      subs: step.subs,
      residualWindowCap: step.residualWindowCap,
      residualStreamRate: step.residualStreamRate,
    });
    residuals.push(built.residual);
    current = built.residual;
  }
  return { steps, residuals };
}
