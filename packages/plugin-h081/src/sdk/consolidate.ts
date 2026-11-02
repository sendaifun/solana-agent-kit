// Note selection and consolidation. The transact and grant circuits take two
// input notes. When covering an amount needs more than two notes, the wallet
// first merges notes pairwise with ordinary fully shielded 2-in-2-out
// transfers to itself (outputs: the sum, and a zero note), until two notes
// cover the amount. No circuit or contract changes: a merge is a transfer.
// Pure functions: no I/O, no proving.

/** The circuits' input arity for transact and grant. */
export const MAX_INPUTS = 2;

/**
 * Largest-first selection of notes covering `needed`. `notes` need not be sorted. Throws when the total is
 * short. The result is sorted largest first and may hold more than MAX_INPUTS notes; see `nextMerge`.
 */
export function selectNotes<T>(
  notes: readonly T[],
  amountOf: (n: T) => bigint,
  needed: bigint,
): T[] {
  const sorted = [...notes]
    .filter((n) => amountOf(n) > 0n)
    .sort((a, b) => {
      const x = amountOf(a);
      const y = amountOf(b);
      return x > y ? -1 : x < y ? 1 : 0;
    });
  const chosen: T[] = [];
  let sum = 0n;
  for (const n of sorted) {
    if (sum >= needed) {
      break;
    }
    chosen.push(n);
    sum += amountOf(n);
  }
  if (sum < needed) {
    throw new Error(
      `insufficient shielded balance: have ${sum}, need ${needed}`,
    );
  }
  return chosen;
}

/**
 * The next pair to merge so that, eventually, at most `maxInputs` notes cover `needed`; undefined when no
 * merge is needed. It merges the two smallest notes of the current selection, so every merge lowers the
 * selection's size by one and `selected - maxInputs` merges suffice.
 */
export function nextMerge<T>(
  notes: readonly T[],
  amountOf: (n: T) => bigint,
  needed: bigint,
  maxInputs = MAX_INPUTS,
): [T, T] | undefined {
  if (maxInputs < 1 || maxInputs > MAX_INPUTS) {
    throw new Error(`maxInputs must be 1..${MAX_INPUTS}`);
  }
  const chosen = selectNotes(notes, amountOf, needed);
  if (chosen.length <= maxInputs) {
    return undefined;
  }
  return [chosen[chosen.length - 2], chosen[chosen.length - 1]];
}

/** The merges `consolidate` would send for these amounts, as pairs of amounts (a dry run; also used by tests). */
export function consolidationPlan(
  amounts: readonly bigint[],
  needed: bigint,
  maxInputs = MAX_INPUTS,
): Array<[bigint, bigint]> {
  let pool = [...amounts];
  const steps: Array<[bigint, bigint]> = [];
  for (;;) {
    const pair = nextMerge(
      pool.map((amount, i) => ({ amount, i })),
      (n) => n.amount,
      needed,
      maxInputs,
    );
    if (!pair) {
      return steps;
    }
    steps.push([pair[0].amount, pair[1].amount]);
    pool = pool.filter((_, i) => i !== pair[0].i && i !== pair[1].i);
    pool.push(pair[0].amount + pair[1].amount);
  }
}
