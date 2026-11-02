// Incremental Poseidon Merkle tree, identical in shape to the on-chain tree
// and to MerkleProof in circuits/lib/merkle.circom.
import { ZERO_LEAF, poseidon } from "./crypto.js";

export interface MerklePath {
  pathElements: bigint[];
  pathIndices: number[];
  root: bigint;
  index: number;
}

export class MerkleTree {
  readonly levels: number;
  readonly zeros: bigint[] = [];
  private layers: bigint[][];

  constructor(levels: number, zeroLeaf = ZERO_LEAF) {
    this.levels = levels;
    let z = zeroLeaf;
    for (let i = 0; i <= levels; i++) {
      this.zeros.push(z);
      z = poseidon([z, z]);
    }
    this.layers = Array.from({ length: levels + 1 }, () => []);
  }

  get size(): number {
    return this.layers[0].length;
  }

  get root(): bigint {
    return this.layers[this.levels][0] ?? this.zeros[this.levels];
  }

  insert(leaf: bigint): number {
    const index = this.size;
    if (index >= 2 ** this.levels) {
      throw new Error("tree is full");
    }
    this.layers[0].push(leaf);
    let i = index;
    for (let level = 0; level < this.levels; level++) {
      i = Math.floor(i / 2);
      const left = this.layers[level][2 * i];
      const right = this.layers[level][2 * i + 1] ?? this.zeros[level];
      this.layers[level + 1][i] = poseidon([left, right]);
    }
    return index;
  }

  insertMany(leaves: bigint[]): number[] {
    return leaves.map((l) => this.insert(l));
  }

  leaf(index: number): bigint {
    return this.layers[0][index];
  }

  indexOf(leaf: bigint): number {
    return this.layers[0].indexOf(leaf);
  }

  path(index: number): MerklePath {
    if (index < 0 || index >= this.size) {
      throw new Error("no such leaf");
    }
    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];
    let i = index;
    for (let level = 0; level < this.levels; level++) {
      const sibling = i % 2 === 0 ? i + 1 : i - 1;
      pathElements.push(this.layers[level][sibling] ?? this.zeros[level]);
      pathIndices.push(i % 2);
      i = Math.floor(i / 2);
    }
    return { pathElements, pathIndices, root: this.root, index };
  }

  /** A path for a leaf that is not in the tree (dummy inputs). */
  emptyPath(): MerklePath {
    return {
      pathElements: this.zeros.slice(0, this.levels),
      pathIndices: new Array(this.levels).fill(0),
      root: this.root,
      index: -1,
    };
  }
}

/** Root of a fixed-depth tree over recipient keys, zero-padded. Used for allow-lists. */
export function recipientListRoot(
  keys: bigint[],
  levels = 8,
): { root: bigint; tree: MerkleTree } {
  const tree = new MerkleTree(levels, 0n);
  tree.insertMany(keys);
  return { root: tree.root, tree };
}
