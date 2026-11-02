// A shielded account: spending key + viewing key, both derived from one secret. Chain-agnostic: the EVM
// client (client.ts) and the Solana SDK (solana/wallet.ts) share it, so a Solana-only consumer does not
// pull ethers in through client.ts.
import {
  type Allowance,
  type SpendingKey,
  keysFromSk,
  randomKeys,
} from "./crypto.js";
import { type ViewingKey, viewingKeyFromSk } from "./encryption.js";

/** What you hand to someone who wants to pay you or fund you. */
export interface StipendAddress {
  pk: bigint;
  viewPub: Uint8Array;
}

export class Account {
  readonly keys: SpendingKey;
  readonly view: ViewingKey;
  constructor(sk: bigint) {
    this.keys = keysFromSk(sk);
    this.view = viewingKeyFromSk(sk);
  }
  static random(): Account {
    return new Account(randomKeys().sk);
  }
  get address(): StipendAddress {
    return { pk: this.keys.pk, viewPub: this.view.pub };
  }
}

/** One line of allowances (a note and its successors) with the lines delegated from it. */
export interface TreasuryNode {
  /** the line's latest note */
  allowance: Allowance;
  commitment: bigint;
  index: number;
  spent: boolean;
  /** the line's first note, as granted or delegated */
  granted: Allowance;
  children: TreasuryNode[];
}
