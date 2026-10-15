import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { PublicKey } from '@solana/web3.js';
import { inspectPaymentReceipt } from '@kairos_elpis/payonce-solana-prototype/receipt';

export const sample = JSON.parse(readFileSync(new URL('./sample.json', import.meta.url), 'utf8'));
const job = sample.storedJob;
export const expected = {
  programId: new PublicKey(sample.program), payer: new PublicKey(job.payer),
  lane: Buffer.from(job.intent.laneHex, 'hex'), sequence: BigInt(job.intent.sequence),
  recipient: new PublicKey(job.intent.recipient), amount: BigInt(job.intent.amountLamports),
  maxFee: BigInt(job.intent.maxFeeLamports),
};

// This checks one recorded AgentKit experiment, not arbitrary future transactions.
export function verify(transaction) {
  const result = inspectPaymentReceipt(transaction, sample.signature, expected);
  assert.equal(result.status, 'paid', `Receipt not established: ${result.status}`);
  assert.equal(result.slot, 511407886);
  const keys = transaction.transaction.message.accountKeys;
  const delta = address => {
    const index = keys.indexOf(address);
    assert.ok(index >= 0, 'Expected account missing');
    const before = transaction.meta.preBalances[index], after = transaction.meta.postBalances[index];
    assert.ok(Number.isSafeInteger(before) && Number.isSafeInteger(after));
    return BigInt(after) - BigInt(before);
  };
  assert.equal(transaction.meta.fee, 5000);
  assert.equal(delta(job.payer), -661240n);
  assert.equal(delta(job.intent.recipient), 651240n);
  assert.equal(delta(sample.treasury), 5000n);
  return { status: 'paid', signature: sample.signature, slot: result.slot,
    amountLamports: '651240', protocolFeeLamports: '5000', networkFeeLamports: '5000' };
}

export async function readLive(rpc) {
  const genesis = await rpc('getGenesisHash', []);
  assert.equal(genesis, job.genesisHash, 'Expected Solana devnet genesis');
  return rpc('getTransaction', [sample.signature, {
    encoding: 'json', commitment: 'finalized', maxSupportedTransactionVersion: 1,
  }]);
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--offline'),
    'Usage: npm run verify [-- --offline]');
  const offline = args[0] === '--offline';
  let requests = 0;
  const rpc = async (method, params) => {
    assert.ok(['getGenesisHash', 'getTransaction'].includes(method));
    requests++;
    const response = await fetch(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: requests, method, params }),
      signal: AbortSignal.timeout(20000),
    });
    assert.ok(response.ok, `RPC HTTP ${response.status}; no payment conclusion`);
    const body = await response.json();
    assert.ok(!body.error, 'RPC error; no payment conclusion');
    return body.result;
  };
  const transaction = offline ? sample.transaction : await readLive(rpc);
  const result = verify(transaction);
  console.log(JSON.stringify({ ...result,
    source: offline ? 'saved fixture; NOT a live chain check' : 'finalized devnet RPC',
    rpcRequests: requests, signedTransactions: 0, submittedTransactions: 0,
    independentAdoptionDemonstrated: false }, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(`Verification stopped: ${error.message}`);
    process.exitCode = 1;
  });
}
