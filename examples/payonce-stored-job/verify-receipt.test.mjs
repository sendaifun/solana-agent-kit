import test from 'node:test';
import assert from 'node:assert/strict';
import { PublicKey } from '@solana/web3.js';
import { inspectPaymentReceipt } from '@kairos_elpis/payonce-solana-prototype/receipt';
import { expected, sample, verify, readLive } from './verify-receipt.mjs';

test('saved transaction matches the authorized job and exact balance deltas', () => {
  assert.equal(verify(sample.transaction).status, 'paid');
});
test('different amount or recipient does not reconcile', () => {
  for (const change of [{ amount: expected.amount + 1n }, { recipient: new PublicKey(sample.treasury) }]) {
    assert.equal(inspectPaymentReceipt(sample.transaction, sample.signature, { ...expected, ...change }).status, 'mismatch');
  }
});
test('missing, failed or altered response cannot pass the verifier', () => {
  const missingLogs = structuredClone(sample.transaction); missingLogs.meta.logMessages = null;
  const failed = structuredClone(sample.transaction); failed.meta.err = { InstructionError: [0, 'InvalidArgument'] };
  const balance = structuredClone(sample.transaction); balance.meta.postBalances[2]++;
  const signature = structuredClone(sample.transaction); signature.transaction.signatures[0] = 'wrong-signature';
  for (const transaction of [null, missingLogs, failed, balance, signature]) {
    assert.throws(() => verify(transaction));
  }
});
test('wrong genesis prevents transaction lookup', async () => {
  const methods = [];
  await assert.rejects(readLive(async method => { methods.push(method); return 'wrong-genesis'; }));
  assert.deepEqual(methods, ['getGenesisHash']);
});
test('live request is finalized; unavailable data and RPC failure never use saved data', async () => {
  const methods = [];
  const transaction = await readLive(async (method, params) => {
    methods.push(method);
    if (method === 'getGenesisHash') return sample.storedJob.genesisHash;
    assert.equal(params[0], sample.signature);
    assert.equal(params[1].commitment, 'finalized');
    return null;
  });
  assert.deepEqual(methods, ['getGenesisHash', 'getTransaction']);
  assert.throws(() => verify(transaction));
  await assert.rejects(readLive(async () => { throw new Error('RPC unavailable'); }), /RPC unavailable/);
});

test('different program, payer, lane or sequence cannot authenticate this job', () => {
  for (const change of [{ programId: new PublicKey(sample.treasury) },
    { payer: new PublicKey(sample.treasury) }, { lane: Buffer.alloc(32) },
    { sequence: expected.sequence + 1n }]) {
    assert.equal(inspectPaymentReceipt(sample.transaction, sample.signature, { ...expected, ...change }).status, 'unproven');
  }
});
